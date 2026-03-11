// Creiamo una piccola interfaccia di supporto per le relazioni
export interface RelazioneBase {
  id: number;
  nome: string;
}

// L'interfaccia del singolo fumetto
export interface Albo {
  id: number;
  // Aggiungi qui i nomi ESATTI delle colonne che hai nel DB di Laravel
  titolo: string; 
  numero?: number;
  data_pubblicazione?: string;
  filename?: string; // Per l'immagine di copertina
  editore?: RelazioneBase;
  collana?: RelazioneBase;
  // ... altri campi come descrizione, ecc.
}

// L'interfaccia per la paginazione di Laravel!
// Laravel quando usa paginate() incapsula i dati dentro un oggetto più grande.
export interface PaginatedResponse<T> {
  data: T[]; // Qui dentro ci sarà il nostro array di Albi
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// QUESTA È LA TUA SCATOLA PERSONALIZZATA DA LARAVEL!
export interface ApiResponse<T> {
  success: boolean;
  dati: PaginatedResponse<T>;
}