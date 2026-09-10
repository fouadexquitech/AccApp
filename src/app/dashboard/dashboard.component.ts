import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login/login.service';
import { User } from '../_models';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: User;
  totalBudget: number = 0;
  packagesTotalBudget: number = 0;
  missingTotalBudget: number = 0;
  quotationTotalBudget: number = 0;
  divisionBudgetData: any[] = [];
  packagesData: any[] = [];
  missingDivisions: any[] = [];
  quotationSuppliers: any[] = [];
  showBudgetDetail = true;
  showPackagesDetail = false;
  showMissingDetail = false;
  showQuotationDetail = false;
  activePrintPanel = '';
  loadingBudget = true;
  loadingDivisionBudget = true;
  loadingPackages = true;
  loadingDivisions = true;
  loadingQuotation = true;

  constructor(
    private loginService: LoginService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loginService.user.subscribe(u => {
      this.user = u;
      if (u) this.loadDashboard();
    });
  }

  loadDashboard(): void {
    const costConn = this.user.usrLoggedConnString;

    this.dashboardService.getProjectTotalBudget(costConn).subscribe({
      next: data => { this.totalBudget = data || 0; this.loadingBudget = false; },
      error: () => this.loadingBudget = false
    });

    this.dashboardService.getBudgetByDivision(costConn).subscribe({
      next: data => { this.divisionBudgetData = data || []; this.loadingDivisionBudget = false; },
      error: () => this.loadingDivisionBudget = false
    });

    this.dashboardService.getMissingByDivision(costConn).subscribe({
      next: data => {
        this.missingDivisions = (data || []).map(d => ({
          ...d, expanded: false, loading: false, resources: null
        }));
        this.missingTotalBudget = (data || []).reduce((sum, d) => sum + (d.totalBudget || 0), 0);
        this.loadingDivisions = false;
      },
      error: () => this.loadingDivisions = false
    });

    this.dashboardService.getPackagesBudget(costConn).subscribe({
      next: data => {
        this.packagesData = data || [];
        this.packagesTotalBudget = this.packagesData.reduce((sum, d) => sum + (d.totalBudget || 0), 0);
        this.loadingPackages = false;
      },
      error: () => this.loadingPackages = false
    });

    this.dashboardService.getQuotationBudget(costConn).subscribe({
      next: data => {
        this.quotationSuppliers = data || [];
        this.quotationTotalBudget = this.quotationSuppliers.reduce((sum, s) => sum + (s.totalBudget || 0), 0);
        this.loadingQuotation = false;
      },
      error: () => this.loadingQuotation = false
    });
  }

  pkgPct(budget: number): number {
    if (!this.totalBudget) return 0;
    return Math.round((budget / this.totalBudget) * 1000) / 10;
  }

  pkgColor(index: number): string {
    return `hsl(${(index * 47) % 360}, 60%, 45%)`;
  }

  printPanel(event: MouseEvent, panel: string): void {
    event.stopPropagation();
    const saved = {
      budget: this.showBudgetDetail,
      packages: this.showPackagesDetail,
      missing: this.showMissingDetail,
      quotation: this.showQuotationDetail
    };
    this.closeAll();
    if (panel === 'budget')    this.showBudgetDetail    = true;
    if (panel === 'packages')  this.showPackagesDetail  = true;
    if (panel === 'missing')   this.showMissingDetail   = true;
    if (panel === 'quotation') this.showQuotationDetail = true;
    this.activePrintPanel = panel;
    setTimeout(() => {
      window.print();
      this.activePrintPanel = '';
      this.closeAll();
      this.showBudgetDetail    = saved.budget;
      this.showPackagesDetail  = saved.packages;
      this.showMissingDetail   = saved.missing;
      this.showQuotationDetail = saved.quotation;
    }, 200);
  }

  private closeAll(): void {
    this.showBudgetDetail = false;
    this.showPackagesDetail = false;
    this.showMissingDetail = false;
    this.showQuotationDetail = false;
  }

  toggleBudgetDetail(): void {
    const next = !this.showBudgetDetail;
    this.closeAll();
    this.showBudgetDetail = next;
  }

  togglePackagesDetail(): void {
    const next = !this.showPackagesDetail;
    this.closeAll();
    this.showPackagesDetail = next;
  }

  toggleMissingDetail(): void {
    const next = !this.showMissingDetail;
    this.closeAll();
    this.showMissingDetail = next;
  }

  toggleQuotationDetail(): void {
    const next = !this.showQuotationDetail;
    this.closeAll();
    this.showQuotationDetail = next;
  }

  toggleDivision(div: any): void {
    div.expanded = !div.expanded;
    if (div.expanded && !div.resources) {
      div.loading = true;
      this.dashboardService.getMissingResourcesForDivision(
        this.user.usrLoggedConnString, div.boqDiv
      ).subscribe({
        next: data => { div.resources = data || []; div.loading = false; },
        error: () => { div.resources = []; div.loading = false; }
      });
    }
  }

  fmt(value: number): string {
    if (value == null) return '-';
    if (Math.abs(value) >= 1_000_000) return (value / 1_000_000).toFixed(2) + ' M';
    if (Math.abs(value) >= 1_000) return (value / 1_000).toFixed(1) + ' K';
    return value.toFixed(0);
  }
}
