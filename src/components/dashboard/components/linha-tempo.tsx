interface Props {
    links: {
        title: string
        selected?:boolean
      }[]
}

export function LinhaTempo(props:Props) {
    return(
        <>
        <div className=" ">
        <div className="border-b w-full relative top-[24px]  "></div>
        <div className="flex justify-between ">
            

            {props.links.map((item, index) => {
                return(
                    <div className="flex w-20 flex-col items-center gap-3 z-[1]">
            <div className={`w-12 h-12 rounded-full border  ${item.selected ? ('bg-[#719CB8] dark:bg-[#719CB8] text-white'):('bg-neutral-50 dark:bg-neutral-900')} whitespace-nowrap flex items-center justify-center text-xl font-bold`}>{index + 1}</div>
            <p className="text-xs text-center font-medium max-w-20">{item.title}</p>
            </div>
                )
            })}

            
            
        </div>
        </div>
        </>
    )
}