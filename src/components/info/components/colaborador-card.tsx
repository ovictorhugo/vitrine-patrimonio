import { Buildings, LinkSimple } from "phosphor-react";
import { Alert } from "../../ui/alert";
import { Link } from "react-router-dom";
import { LinkedinIcon, Mail, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

// Componente filho (card)
export function ColaboradorCard({ colaborador, className = "" }) {
  return (
    <div className={`flex group w-full min-w-0 ${className}`}>
      <div className="w-2 min-w-2 rounded-l-md border dark:border-neutral-800 border-r-0 bg-eng-blue" />
      
      <Alert className="rounded-l-none flex flex-col gap-3 p-6 flex-1 min-w-0">
        {/* Linha com avatar + textos */}
        <div className="flex gap-3 items-start min-w-0">
          <Avatar className="h-12 w-12 rounded-md shrink-0">
            <AvatarImage src={colaborador.foto} />
            <AvatarFallback><User size={20} /></AvatarFallback>
          </Avatar>

          {/* Wrapper dos textos */}
          <div className="mb-8 flex-1 min-w-0">
            <p className="text-lg font-medium truncate">{colaborador.nome}</p>
            <p className="text-sm text-gray-500 truncate">{colaborador.instituicao}</p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {colaborador.lattes && (
            <a href={colaborador.lattes} target="_blank" rel="noreferrer"
               className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              <LinkSimple size={12}/>Currículo Lattes
            </a>
          )}
          {colaborador.linkedin && (
            <a href={colaborador.linkedin} target="_blank" rel="noreferrer"
               className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              <LinkedinIcon size={12}/>LinkedIn
            </a>
          )}
          {colaborador.email && (
            <a href={`mailto:${colaborador.email}`}
               className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              <Mail size={12}/><span className="truncate max-w-[240px] md:max-w-[320px]">{colaborador.email}</span>
            </a>
          )}
        </div>
      </Alert>
    </div>
  );
}
