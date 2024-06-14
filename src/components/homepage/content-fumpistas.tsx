import { ArrowRight } from "phosphor-react";
import { Alert } from "../ui/alert";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from 'firebase/firestore';

interface User {
    photoURL:string
    cpf_aluno: string
    datnsc_aluno:string
    state: string
  }

export function ContentFumpistas() {
    const db = getFirestore();
    const [usersPhoto, setUsers] = useState<User[]>([]);

    useEffect(() => {
        

        const getRandomItems = (array:any, num:any) => {
            const shuffled = [...array].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, num);
          };

          const fetchUsers = async () => {
            try {
              const usersRef = collection(db, 'users');
              const querySnapshot = await getDocs(usersRef);
              const usersList = querySnapshot.docs.map(doc => doc.data() as User);
              const randomUsers = getRandomItems(usersList, 3);
              setUsers(randomUsers);
            } catch (err) {
              console.log(err);
            }
          };
    
        fetchUsers();
      }, []);

    return(
        <Alert className="w-full md:w-[280px] mb-8 md:m-0  md:min-h-[410px] md:mr-8 p-10 flex items-end ">
    <div>

        <div className="mb-4 flex">
        {usersPhoto.map((user, index) => (
        <div key={index} className={`rounded-full bg-cover bg-center bg-no-repeat relative -left-${index * 3}  bg-gray-100 h-12 w-12`} style={{ backgroundImage: `url(${user.photoURL || ''})` }}></div>
      ))}
            
        </div>
    <h2 className=" text-3xl font-bold mb-1">Crie uma conta e torne-se doador</h2>


                  <div className="flex items-center">
                  <div className="w-full bg-black h-[1px]"></div>
                  <ArrowRight size={16} className="p-0 w-fit"  />
                 
                  </div>
    </div>
    <div></div>
</Alert>
    )
}