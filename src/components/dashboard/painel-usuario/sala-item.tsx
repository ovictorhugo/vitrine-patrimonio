import { ChevronLeft, Tag } from "lucide-react";
import { Alert } from "../../ui/alert";
import { Button } from "../../ui/button";
import { ArrowArcLeft } from "phosphor-react";

export function SalaItem() {
    return(
        <div className="p-1">
            <Alert className="border-none bg-transparent p-0 h-[140px] " >
            <div className="h-full">
            <div className=" rounded-xl ">
            <div className="flex justify-between w-full">
            <div className="flex gap-3 bg-white rounded-bl-xl border w-full border-r-0  rounded-tl-xl  items-center p-4">
                            <Tag size={20}/>
                            <div>
                                <p className="font-medium">I</p>
                                <p className="text-xs">Infor</p>
                            </div>
                        </div>

                        <div className="flex">
                            <div>
                            <div className="h-full w-[44px] bg-white border border-l-0 border-r-0 rounded-tr-xl "></div>
                            </div>
                            <div className="flex flex-col h-full">
                            <div className="flex">
                                <div className="bg-white absolute top-0 w-[44px]  h-full  max-h-[80px]"></div>
                            <div className="bg-neutral-50 z-[9] h-fit dark:bg-neutral-900 p-2 flex gap-3 rounded-bl-xl ">
                        <Button variant="outline" size="icon" className="h-7 w-7">
                <ArrowArcLeft className="h-4 w-4" />

              </Button>

              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
              </Button>
                        </div>
                            </div>
                        <div className="h-full">
                            <div className="min-h-[44px] h-full max-h-[80px] w-full bg-white rounded-br-xl border border-l-0 rounded-tr-xl "></div>
                            </div>
                            </div>
                        </div>

            </div>
            </div>
            </div>
              </Alert>
            </div>
    )
}