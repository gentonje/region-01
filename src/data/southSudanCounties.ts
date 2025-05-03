
export interface County {
  id: string;
  name: string;
  state: string;
}

export const southSudanCounties: County[] = [
  // Central Equatoria
  { id: "juba", name: "Juba", state: "Central Equatoria" },
  { id: "yei", name: "Yei", state: "Central Equatoria" },
  { id: "kajo-keji", name: "Kajo-Keji", state: "Central Equatoria" },
  { id: "lainya", name: "Lainya", state: "Central Equatoria" },
  { id: "morobo", name: "Morobo", state: "Central Equatoria" },
  { id: "terekeka", name: "Terekeka", state: "Central Equatoria" },
  
  // Eastern Equatoria
  { id: "torit", name: "Torit", state: "Eastern Equatoria" },
  { id: "kapoeta", name: "Kapoeta", state: "Eastern Equatoria" },
  { id: "budi", name: "Budi", state: "Eastern Equatoria" },
  { id: "ikotos", name: "Ikotos", state: "Eastern Equatoria" },
  { id: "magwi", name: "Magwi", state: "Eastern Equatoria" },
  
  // Western Equatoria
  { id: "yambio", name: "Yambio", state: "Western Equatoria" },
  { id: "nzara", name: "Nzara", state: "Western Equatoria" },
  { id: "tambura", name: "Tambura", state: "Western Equatoria" },
  { id: "ezo", name: "Ezo", state: "Western Equatoria" },
  { id: "maridi", name: "Maridi", state: "Western Equatoria" },
  { id: "mundri", name: "Mundri", state: "Western Equatoria" },
  
  // Warrap
  { id: "kuajok", name: "Kuajok", state: "Warrap" },
  { id: "gogrial", name: "Gogrial", state: "Warrap" },
  { id: "tonj", name: "Tonj", state: "Warrap" },
  { id: "twic", name: "Twic", state: "Warrap" },
  
  // Western Bahr el Ghazal
  { id: "wau", name: "Wau", state: "Western Bahr el Ghazal" },
  { id: "raja", name: "Raja", state: "Western Bahr el Ghazal" },
  { id: "jur-river", name: "Jur River", state: "Western Bahr el Ghazal" },
  
  // Northern Bahr el Ghazal
  { id: "aweil", name: "Aweil", state: "Northern Bahr el Ghazal" },
  { id: "aweil-east", name: "Aweil East", state: "Northern Bahr el Ghazal" },
  { id: "aweil-west", name: "Aweil West", state: "Northern Bahr el Ghazal" },
  { id: "aweil-north", name: "Aweil North", state: "Northern Bahr el Ghazal" },
  { id: "aweil-south", name: "Aweil South", state: "Northern Bahr el Ghazal" },
  
  // Lakes
  { id: "rumbek", name: "Rumbek", state: "Lakes" },
  { id: "yirol", name: "Yirol", state: "Lakes" },
  { id: "awerial", name: "Awerial", state: "Lakes" },
  { id: "wulu", name: "Wulu", state: "Lakes" },
  { id: "cueibet", name: "Cueibet", state: "Lakes" },
  
  // Unity
  { id: "bentiu", name: "Bentiu", state: "Unity" },
  { id: "mayom", name: "Mayom", state: "Unity" },
  { id: "leer", name: "Leer", state: "Unity" },
  { id: "koch", name: "Koch", state: "Unity" },
  { id: "panyijiar", name: "Panyijiar", state: "Unity" },
  
  // Jonglei
  { id: "bor", name: "Bor", state: "Jonglei" },
  { id: "pibor", name: "Pibor", state: "Jonglei" },
  { id: "akobo", name: "Akobo", state: "Jonglei" },
  { id: "nyirol", name: "Nyirol", state: "Jonglei" },
  { id: "twic-east", name: "Twic East", state: "Jonglei" },
  { id: "duk", name: "Duk", state: "Jonglei" },
  
  // Upper Nile
  { id: "malakal", name: "Malakal", state: "Upper Nile" },
  { id: "renk", name: "Renk", state: "Upper Nile" },
  { id: "melut", name: "Melut", state: "Upper Nile" },
  { id: "fashoda", name: "Fashoda", state: "Upper Nile" },
  { id: "maban", name: "Maban", state: "Upper Nile" },
  { id: "baliet", name: "Baliet", state: "Upper Nile" }
];

export const getStatesList = () => {
  return [...new Set(southSudanCounties.map(county => county.state))];
};

export const getCountiesByState = (stateName: string) => {
  return southSudanCounties.filter(county => county.state === stateName);
};

export const getAllCounties = () => {
  return southSudanCounties;
};
