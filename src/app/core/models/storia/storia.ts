import { RelazioneBase } from "../albo";

// Un singolo elemento della tabella a 3 vie autore+ruolo
export interface AutoreRuolo {
  autore_id: number;
  ruolo_id: number;
  // Oggetti completi usati solo lato frontend per mostrare i nomi
  autore?: RelazioneBase;
  ruolo?: RelazioneBase;
}

export interface Storia {
  id: number;
  nome: string;
  trama?: string;
  stato: 'in_corso' | 'autoconclusiva' | 'finita';
  autori_ruoli?: AutoreRuolo[];
}

export interface StoriaApiResponse {
  success: boolean;
  dati: {
    data: Storia[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
