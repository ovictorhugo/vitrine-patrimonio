import { Favoritos } from "../components/favoritos";
import { Salas } from "../components/salas";

export function Homepage() {
  return (
    <div className="flex flex-col gap-8 p-8 pt-0">
      <Salas />

      <Favoritos />
    </div>
  );
}
