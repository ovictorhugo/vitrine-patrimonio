import { Link } from "react-router-dom";
import { useModalDashboard } from "../hooks/use-modal-dashboard";
import { Button } from "../ui/button";
import { Coins, PlusCircle, Trash, User } from "phosphor-react";
import bg2 from '../../assets/bg_admin.png';
import { toast } from "sonner"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "../../components/ui/breadcrumb"
import { Navbar } from "./navbar";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';


import { DataTable } from "./data-table";
import { columns } from "./columns";
import { useModal } from "../hooks/use-modal-store";
import { AddAdmin } from "./components/add-admin";
import { Alert } from "../ui/alert";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

type UserEmail = {
  id: string;
  email: string;
  name:string
  state:string
};

type Background = {
    id: string;
    imgURL: string;
    titulo:string
  };

export function GeralDashboard() {
    const { isOpen, type} = useModalDashboard();
    const db = getFirestore();

    const isModalOpen = isOpen && type === "general";

    const [emails, setEmails] = useState<UserEmail[]>([]);

  useEffect(() => {
    const fetchEmails = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const emailsData = querySnapshot.docs.map(doc => ({
        id: doc.data().uid,
        email: doc.data().email,
        name:doc.data().displayName,
        state:doc.data().state

      }));
            // Filtrar os emails com state 'a fumpista' ou 'doador'
            const filteredEmails = emailsData.filter(
                email => email.state === 'admin' 
              );
              
              setEmails(filteredEmails);
        
    };

    fetchEmails();
  }, []);

  const [background, setBackground] = useState<Background[]>([]);

  const deleteItem = async (id: string) => {
    if (!id) {
      console.error("ID is undefined");
      return;
    }

    try {
      // Cria uma query para buscar o documento com o campo 'id' igual ao id fornecido
      const q = query(collection(db, 'background'), where('id', '==', id));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (docSnapshot) => {
        // Referência do documento no Firestore
        const docRef = doc(db, 'background', docSnapshot.id);
        await deleteDoc(docRef);
        
        // Atualiza o estado para remover o item excluído
        setBackground(prevBackground => prevBackground.filter(item => item.id !== id));

        toast("Background deletado", {
            description: "Operação realizada com sucesso",
            action: {
              label: "Fechar",
              onClick: () => console.log("Undo"),
            },
          })
      });
    } catch (error) {
      console.error("Erro ao excluir documento: ", error);
    }
  };

  useEffect(() => {
    const fetchEmails = async () => {
      const querySnapshot = await getDocs(collection(db, 'background'));
      const emailsData = querySnapshot.docs.map(doc => ({
        id: doc.data().id,
        titulo:doc.data().titulo,
        imgURL:doc.data().imgURL

      }));
           
              
              setBackground(emailsData);
        
    };

    fetchEmails();
  }, []);



const {user} = useContext(UserContext)
const {onOpen} = useModal()

    return(
        <>
         {isModalOpen && (
            < div className="w-full">
              
           </div>
        )}
        </>
    )
}