import { NavLink } from "react-router-dom";
import { buttonVariants } from "./ui/button";
import Logo from "./Logo";
import { CalendarDays, HomeIcon, NotebookIcon, TimerIcon } from "lucide-react";
import SideSheet from "./SideSheet";
import TimeMachinePopup from "./TimeMachine";

//TODO: navbar non responsive in larghezza
//TODO: foto profilo non responsive sul telefono

export default function Navbar() {
  return (
    <nav>
      {/* Sidebar verticale desktop */}
      <div className="hidden md:flex fixed top-0 left-0 h-full w-48 flex-col justify-between bg-card border-r z-50 py-6 px-4">
        {/* Top: Logo + Navigazione */}
        <div className="flex flex-col gap-6">
          <NavLink to="/home">
            <Logo size="md" />
          </NavLink>

          <div className="flex flex-col gap-8">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `${isActive
                  ? buttonVariants({ variant: "default" })
                  : buttonVariants({ variant: "ghost" })} justify-start flex gap-2`
              }
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/pomodoro"
              className={({ isActive }) =>
                `${isActive
                  ? buttonVariants({ variant: "default" })
                  : buttonVariants({ variant: "ghost" })} justify-start flex gap-2`
              }
            >
              <TimerIcon className="w-5 h-5" />
              <span>Pomodoro</span>
            </NavLink>

            <NavLink
              to="/calendar"
              className={({ isActive }) =>
                `${isActive
                  ? buttonVariants({ variant: "default" })
                  : buttonVariants({ variant: "ghost" })} justify-start flex gap-2`
              }
            >
              <CalendarDays className="w-5 h-5" />
              <span>Calendar</span>
            </NavLink>

            <NavLink
              to="/notes"
              className={
                ({ isActive }) =>
                `${isActive ? buttonVariants({ variant: "default" }) : buttonVariants({ variant: "ghost" })} justify-start flex gap-2`
              }
            >
              <NotebookIcon className="w-5 h-5" />
              <span>Notes</span>
            </NavLink>
            <TimeMachinePopup />
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <SideSheet />
        </div>
      </div>

      {/* Bottom mobile navbar */}
      {/* Added backface-visibility-hidden for mozilla android cause of a fixed position not working, Chat GPT */}
      <div className="md:hidden flex h-12 fixed backface-visibility-hidden left-0 bottom-0 w-full p-1 bg-background justify-around items-end gap-5 z-50 border-t border-border">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            [
              isActive
                ? buttonVariants({ variant: "default", size: "icon" })
                : buttonVariants({ variant: "ghost", size: "icon" }),
            ].join(" ")
          }
        >
          <HomeIcon />
        </NavLink>

        <NavLink
          to="/pomodoro"
          className={({ isActive }) =>
            [
              isActive
                ? buttonVariants({ variant: "default", size: "icon" })
                : buttonVariants({ variant: "ghost", size: "icon" }),
            ].join(" ")
          }
        >
          <TimerIcon />
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            [
              isActive
                ? buttonVariants({ variant: "default", size: "icon" })
                : buttonVariants({ variant: "ghost", size: "icon" }),
            ].join(" ")
          }
        >
          <CalendarDays />
        </NavLink>

        <NavLink
          to="/notes"
          className={({ isActive }) =>
            [
              isActive
                ? buttonVariants({ variant: "default", size: "icon" })
                : buttonVariants({ variant: "ghost", size: "icon" }),
            ].join(" ")
          }
        >
          <NotebookIcon />
        </NavLink>
        <TimeMachinePopup />
        <SideSheet />
      </div>
    </nav>
  );
}
