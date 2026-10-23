export interface Provider {
  id: string;
  name: string;
  service: string;
  city: string;
  available: boolean;
}

export const providers: Provider[] = [
  {
    id: "p-001",
    name: "Kouassi Électricité",
    service: "electricien",
    city: "Bondoukou",
    available: true,
  },
  {
    id: "p-002",
    name: "Yao Plomberie",
    service: "plombier",
    city: "Bondoukou",
    available: true,
  },
  {
    id: "p-003",
    name: "Koné Services",
    service: "electricien",
    city: "Bondoukou",
    available: false,
  },
  {
    id: "p-004",
    name: "Aminata Déménagement",
    service: "demenagement",
    city: "Bondoukou",
    available: true,
  },
];
