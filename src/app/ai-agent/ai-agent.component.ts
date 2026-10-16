import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LoginService } from '../login/login.service';
import { User } from '../_models';
import { AiAgentAction, AiAgentService, AiChatMessage, AiChatPageContext } from './ai-agent.service';

/**
 * AI Vendan Agent – floating chat bot shown on every authenticated page.
 * Read-only assistant: answers questions on packages / suppliers / revisions,
 * explains comparison sheets and offers navigation buttons.
 */
@Component({
  selector: 'app-ai-agent',
  templateUrl: './ai-agent.component.html',
  styleUrls: ['./ai-agent.component.css']
})
export class AiAgentComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scrollArea') scrollArea: ElementRef<HTMLDivElement>;
  @ViewChild('inputBox') inputBox: ElementRef<HTMLTextAreaElement>;

  user: User;
  input = '';
  loading = false;
  page: AiChatPageContext = { route: '/' };
  private shouldScroll = false;
  private subs: Subscription[] = [];
  private pending: Subscription;

  constructor(
    public agent: AiAgentService,
    private loginService: LoginService,
    private router: Router
  ) {}

  get messages(): AiChatMessage[] { return this.agent.messages; }
  get isOpen(): boolean { return this.agent.isOpen; }

  ngOnInit(): void {
    this.subs.push(this.loginService.user.subscribe(u => {
      // new user / project -> start a fresh conversation
      if (!u || (this.user && u.usrLoggedConnString !== this.user.usrLoggedConnString)) {
        this.agent.reset();
      }
      this.user = u;
    }));

    this.updatePageContext();
    this.subs.push(this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.updatePageContext()));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.pending) this.pending.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.scrollArea) {
      const el = this.scrollArea.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.shouldScroll = false;
    }
  }

  // ---------------------------------------------------------------- UI

  toggle(): void {
    this.agent.isOpen = !this.agent.isOpen;
    if (this.agent.isOpen) {
      this.updatePageContext();
      this.shouldScroll = true;
      setTimeout(() => this.inputBox?.nativeElement.focus(), 50);
    }
  }

  newChat(): void {
    if (this.pending) this.pending.unsubscribe();
    this.loading = false;
    this.agent.reset();
    this.input = '';
  }

  onKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      this.send();
    }
  }

  get suggestions(): string[] {
    const r = this.page.route || '';
    if (r.startsWith('/package-comparison') && this.page.packageId) {
      return ['Explain this comparison', 'Who is the lowest bidder and how far from budget?', 'Which suppliers have incomplete offers?'];
    }
    if (r.startsWith('/package-supplier') && this.page.packageId) {
      return ['Which suppliers submitted a price on this package?', 'Are any offers expired?', 'Summarise the comparison of this package'];
    }
    return ['Give me an overview of the project', 'Which offers expire in the next 7 days?', 'Which suppliers have not submitted a price yet?'];
  }

  send(text?: string): void {
    const content = (text ?? this.input).trim();
    if (!content || this.loading || !this.user) return;

    this.updatePageContext();
    this.agent.messages.push({ role: 'user', content, time: new Date() });
    this.input = '';
    this.loading = true;
    this.shouldScroll = true;

    const history = this.agent.messages
      .filter(m => !m.isError)
      .map(m => ({ role: m.role, content: m.content }));

    this.pending = this.agent.chat({
      messages: history,
      costConn: this.user.usrLoggedConnString,
      projectName: this.user.usrLoggedProjectName,
      userName: this.user.usrDesc || this.user.usrEmail,
      page: this.page
    }).subscribe({
      next: res => {
        this.agent.messages.push({
          role: 'assistant',
          content: res?.reply || '…',
          actions: res?.actions || [],
          toolsUsed: res?.toolsUsed || [],
          time: new Date()
        });
        this.loading = false;
        this.shouldScroll = true;
      },
      error: err => {
        // the app's ErrorInterceptor re-throws a plain string (err.error.message || statusText)
        const msg = typeof err === 'string' ? err
          : typeof err?.error === 'string' ? err.error
          : (err?.message || 'Unknown error');
        this.agent.messages.push({
          role: 'assistant',
          content: 'Sorry, the AI Vendan Agent is not available right now.\n\n`' + msg + '`',
          isError: true,
          time: new Date()
        });
        this.loading = false;
        this.shouldScroll = true;
      }
    });
  }

  runAction(a: AiAgentAction): void {
    if (!a?.route?.length) return;
    const target = this.router.createUrlTree(a.route).toString().split('?')[0];
    const current = this.router.url.split('?')[0];
    const go = () => this.router.navigate(a.route, a.state ? { state: a.state } : {});
    // pages such as the comparison read their navigation state only when created,
    // so when we are already on the same path we force a reload of the component
    if (target === current || (a.state && current.startsWith(String(a.route[0])))) {
      this.router.navigateByUrl('/home', { skipLocationChange: true }).then(() => go());
    } else {
      go();
    }
  }

  // ---------------------------------------------------------------- page context

  private updatePageContext(): void {
    const url = (this.router.url || '/').split('?')[0];
    const seg = url.split('/').filter(s => s);
    const ctx: AiChatPageContext = { route: url };
    const st: any = (typeof history !== 'undefined' && history.state) || {};

    switch (seg[0]) {
      case 'package-comparison-novo':
      case 'package-comparison':
        if (st.packageId) { ctx.packageId = +st.packageId; ctx.packageName = st.packageName; }
        break;
      case 'package-supplier':
        if (seg[1]) ctx.packageId = +seg[1];
        break;
      case 'technical-conditions':
        if (seg[1]) { ctx.packageId = +seg[1]; ctx.packageName = decodeURIComponent(seg[2] || ''); }
        break;
      case 'package-groups':
        if (seg[1]) { ctx.packageId = +seg[1]; ctx.packageName = decodeURIComponent(seg[2] || ''); }
        break;
      case 'revision-details':
        // /revision-details/:revisionId/:psId/:psByBoq/:packageId/:packageName
        if (seg[4]) { ctx.packageId = +seg[4]; ctx.packageName = decodeURIComponent(seg[5] || ''); }
        break;
    }
    if (ctx.packageId != null && isNaN(ctx.packageId)) delete ctx.packageId;
    this.page = ctx;
  }

  // ---------------------------------------------------------------- markdown (small & safe)

  render(md: string): string {
    if (!md) return '';
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const inline = (s: string) => esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');

    const lines = md.replace(/\r/g, '').split('\n');
    const out: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // fenced code
      if (line.trim().startsWith('```')) {
        const buf: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) { buf.push(lines[i]); i++; }
        i++;
        out.push('<pre>' + esc(buf.join('\n')) + '</pre>');
        continue;
      }

      // table
      if (line.trim().startsWith('|')) {
        const rows: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i].trim()); i++; }
        const cells = (r: string) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
        const isSep = (r: string) => /^\|?\s*:?-{2,}/.test(r);
        let html = '<div class="ai-table-wrap"><table>';
        rows.forEach((r, idx) => {
          if (isSep(r)) return;
          const tag = idx === 0 && rows.length > 1 && isSep(rows[1]) ? 'th' : 'td';
          html += '<tr>' + cells(r).map(c => {
            const num = /^[-+]?[\d,.\s%]+$/.test(c) && /\d/.test(c);
            return `<${tag}${num ? ' class="num"' : ''}>${inline(c)}</${tag}>`;
          }).join('') + '</tr>';
        });
        out.push(html + '</table></div>');
        continue;
      }

      // lists
      if (/^\s*([-*•]|\d+[.)])\s+/.test(line)) {
        const ordered = /^\s*\d+[.)]\s+/.test(line);
        const items: string[] = [];
        while (i < lines.length && /^\s*([-*•]|\d+[.)])\s+/.test(lines[i])) {
          items.push('<li>' + inline(lines[i].replace(/^\s*([-*•]|\d+[.)])\s+/, '')) + '</li>');
          i++;
        }
        out.push((ordered ? '<ol>' : '<ul>') + items.join('') + (ordered ? '</ol>' : '</ul>'));
        continue;
      }

      // headings
      const h = /^(#{1,4})\s+(.*)$/.exec(line);
      if (h) { out.push('<div class="ai-h">' + inline(h[2]) + '</div>'); i++; continue; }

      if (!line.trim()) { i++; continue; }

      // paragraph
      const para: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^\s*([-*•]|\d+[.)])\s+/.test(lines[i])
             && !lines[i].trim().startsWith('|') && !lines[i].trim().startsWith('```') && !/^#{1,4}\s/.test(lines[i])) {
        para.push(inline(lines[i]));
        i++;
      }
      out.push('<p>' + para.join('<br>') + '</p>');
    }
    return out.join('');
  }
}
