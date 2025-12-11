import { Anunciados } from "../components/anunciados";
import { useContext } from "react";
import { UserContext } from "../../../../context/context";

export function CatalogPage() {
  const { user } = useContext(UserContext);
  return <Anunciados filter={{ type: "user_id", value: user?.id || "" }} />;
}
