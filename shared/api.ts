export interface DemoResponse {
  message: string;
}

export interface EstimateRequest {
  dish: string;
}

export interface Ingredient {
  name: string;
  carbon_kg: number;
}

export interface EstimateResponse {
  dish: string;
  estimated_carbon_kg: number;
  ingredients: Ingredient[];
}
