import { useContext } from "react";
import { Alert } from "../../ui/alert";
import { UserContext } from "../../../context/context";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"

export function UserInformation() {
    const {user} = useContext(UserContext)
    return(
        <Alert className="flex gap-3 items-center">
             <Avatar className="cursor-pointer rounded-md">
                    <AvatarImage  className={'rounded-md'} src={`${user.photoURL != null ? (user.photoURL):(user.img_url)}`} />
                    <AvatarFallback className="flex items-center justify-center"></AvatarFallback>
                </Avatar>
            <div>
            <p className="text-xs truncate font-bold max-w-[180px]">{user.displayName}</p>
            <p className="text-xs truncate max-w-[180px]">{user.email}</p>
            </div>
        </Alert>
    )
}