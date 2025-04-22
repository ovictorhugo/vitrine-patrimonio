interface Props {
  title: string,
  children?: any
  icon: any
}

export function HeaderResultTypeHome(props: Props) {
  return (
    <div className="flex gap-4 w-full justify-between items-center">
      <div className="flex gap-4 items-center">
        {props.icon}
        <p className=" font-medium">{props.title}</p>
      </div>

      <div className="flex gap-3  items-center h-full">
        {props.children}
      </div>

    </div>
  )
}