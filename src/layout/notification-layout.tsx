
interface MailProps {

  children:React.ReactNode
}
export default function NotificationLayout(props:MailProps) {
  
    return (
        <div className="h-screen overflow-y-auto flex flex-1">
        {props.children}
        </div>
    );
  };
  
