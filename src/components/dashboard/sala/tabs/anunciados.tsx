import { useQuery } from "../../../authentication/signIn";
import { Anunciados } from "../../dashboard-page/components/anunciados";

export function AnunciadosSala() {
  const queryUrl = useQuery();
  const type_search = queryUrl.get("loc_id");

  return (
    <Anunciados filter={{ type: "location_id", value: type_search || "" }} />
  );
}
