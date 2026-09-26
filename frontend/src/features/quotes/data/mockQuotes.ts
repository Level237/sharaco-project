import { Quote } from "../types/Quote";

export const mockQuotes: Quote[] = [
    {
        id: "Q-1024",
        clientName: "Acme Corp",
        amount: 2500.00,
        status: "Accepted",
        date: "2024-02-12",
        avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
        initials: "AC"
    },
    {
        id: "Q-1023",
        clientName: "Globex Inc",
        amount: 5350.50,
        status: "Sent",
        date: "2024-02-11",
        avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
        initials: "GL"
    },
    {
        id: "Q-1022",
        clientName: "Soylent Corp",
        amount: 950.00,
        status: "Draft",
        date: "2024-02-10",
        initials: "SC"
    },
    {
        id: "Q-1021",
        clientName: "Initech",
        amount: 12000.00,
        status: "Rejected",
        date: "2024-02-09",
        avatarUrl: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
        initials: "IN"
    },
    {
        id: "Q-1020",
        clientName: "Umbrella Corp",
        amount: 6500.00,
        status: "Sent",
        date: "2024-02-08",
        initials: "UC"
    },
    {
        id: "Q-1019",
        clientName: "Stark Industries",
        amount: 45000.00,
        status: "Draft",
        date: "2024-02-05",
        avatarUrl: "https://i.pravatar.cc/150?u=a04258114e29026702d",
        initials: "SI"
    },
    {
        id: "Q-1018",
        clientName: "Wayne Enterprises",
        amount: 18500.00,
        status: "Accepted",
        date: "2024-02-01",
        initials: "WE"
    }
];
