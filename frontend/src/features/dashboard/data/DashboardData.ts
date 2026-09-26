import { Book, Home, Recycle, RedoDot, RefreshCwOffIcon, User, Users } from "lucide-react";

export const dashboardData=[
    {
        id:1,
        menu:"Dashboard",
        icon:Home
    },{
        id:2,
        menu:"Devis Récents",
        icon:Recycle,
        isAction:true,
    },{

        id:3,
        menu:"Utilisateurs",
        icon:Users,
        items:[
            {
                itemsId:"3-1",
                title:"Nouveau utilisateur"
            },{
                itemsId:"3-2",
                title:"Utilisateurs"
            }
        ]
    },{
        id:4,
        menu:"Mon Profile",
        icon:User
    }
]