import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { TokenService } from '../../core/services/token.service';
import { TokenInfo } from './documenation.model';

const CORE = [DecimalPipe];

@Component({
  selector: 'app-documentation',
  imports: [...CORE],
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentationComponent implements OnInit {
  private tokenService = inject(TokenService);
  private cdr = inject(ChangeDetectorRef);

  polygonScan =
    'https://polygonscan.com/address/0x7B7758077e51Bc1Be499eF9180f82E16019065cD';

  tokenData = signal<TokenInfo | null>(null);
  infoError = signal<string | null>(null);
  isLoadingInfo = signal(false);

  ngOnInit(): void {
    this.fetchTokenData();
  }

  fetchTokenData(): void {
    this.isLoadingInfo.set(true);
    this.infoError.set(null);
    this.tokenData.set(null);
    this.cdr.markForCheck();

    this.tokenService
      .getTokenInfo()
      .pipe(
        finalize(() => {
          this.isLoadingInfo.set(false);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (results) => this.handleTokenInfoResult(results),
        error: (error) => this.handleTokenInfoError(error),
      });
  }

  private handleTokenInfoResult(results: TokenInfo | null): void {
    if (this.isValidTokenInfo(results)) {
      this.tokenData.set(results);
    } else {
      this.infoError.set(
        'Não foi possível buscar todas as informações do token ou os dados são inválidos.'
      );
      this.tokenData.set(null);
    }
  }

  private isValidTokenInfo(data: TokenInfo | null): data is TokenInfo {
    return (
      !!data && (data.metadata?.name !== 'Erro' || data.totalMinted !== null)
    );
  }

  private handleTokenInfoError(error: any): void {
    console.error('Erro inesperado ao buscar dados do token:', error);
    this.infoError.set('Ocorreu um erro inesperado ao buscar informações.');
    this.tokenData.set(null);
  }
}
