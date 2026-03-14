export interface Autore {
  id: number;
  cognome: string;
  nome?: string;
  pseudonimo?: string;
}

export interface AutoreApiResponse {
  success: boolean;
  dati: {
    data: Autore[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
