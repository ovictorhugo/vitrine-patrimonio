import { LogoUfmgWhite } from "../svg/logo_ufmg_white";
import { LogoWhite } from "../svg/logo_white";
import bg1 from '../../assets/bg1-white.png';
import bg2 from '../../assets/bg2-white.png';
import { useState } from "react";
import { useModalBackground } from "../hooks/use-modal-background";
import { Logo } from "../svg/logo";
import { LogoUfmg } from "../svg/logo-ufmg";
import { Link } from "react-router-dom";

export function Background2() {
    const { isOpen, type, onOpen } = useModalBackground();
    const isModalOpen = isOpen && type === '2'

    const backgroundImages = [
        bg2
        // Adicione mais URLs de imagens de fundo, se necessário
      ];
    
    
    
      //background
      const [backgroundImage, setBackgroundImage] = useState<string>(() => {
        const randomIndex = Math.floor(Math.random() * backgroundImages.length);
        return backgroundImages[randomIndex];
      });
    return(
       <>
       {isModalOpen && (
         <div className="w-full h-screen  bg-cover bg-center bg-no-repeat  absolute top-0 left-0" style={{ backgroundImage: `url(${backgroundImage})` }}>
     
 </div>
       )}
       </>
    )
}