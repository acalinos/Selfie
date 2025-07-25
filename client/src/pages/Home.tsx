import {
  CalendarDaysIcon,
  CalendarRangeIcon,
  CalendarX2Icon,
  CalendarFoldIcon,
  ClockIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useEvents } from "@/context/EventContext";
import { useNoteContext } from "@/context/NoteContext";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table";
import { EventType, RecurrenceType } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { NavLink, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { RadialPomodoroChart } from "@/components/dashboard/RadialPomodoroChart";
import NoteCard from "@/components/editor/notecard";
import SendMessage from "@/components/dashboard/SendMessage";
import moment from "moment";
import { useTimeMachineContext } from "@/context/TimeMachine";
import ActivityTable from "@/components/ActivityList";

export default function Home() {
  const { events } = useEvents();
  const { notes } = useNoteContext();
  const { currentDate } = useTimeMachineContext();
  const [pomodoroEvent, setPomodoroEvent] = useState<EventType | null>(null);
  const [pomodoroProgress, setPomodoroProgress] = useState(0);
  const navigate = useNavigate();

  const eventFilter: FilterFn<EventType> = (
    row: Row<EventType>,
    columnId: string,
    filterValue: unknown
  ) => {
    const filter: string[] = filterValue as string[];
    let condition = false;
    if (filter.includes("monthly")) {
      const value = row.getValue<RecurrenceType>(columnId);
      if (value) condition ||= value.frequency === "monthly";
      else condition ||= false;
    }
    if (filter.includes("weekly")) {
      const value = row.getValue<RecurrenceType>(columnId);
      if (value) condition ||= value.frequency === "weekly";
      else condition ||= false;
    }
    if (filter.includes("daily")) {
      const value = row.getValue<RecurrenceType>(columnId);
      if (value) condition ||= value.frequency === "daily";
      else condition ||= false;
    }
    if (filter.includes("none")) {
      const value = row.getValue<RecurrenceType>(columnId);
      console.log("value on none: ", value);
      condition ||= !value;
    }
    return condition;
  };

  const frequencies = [
    {
      value: "monthly",
      label: "Monthly",
      icon: CalendarDaysIcon,
    },
    {
      value: "weekly",
      label: "Weekly",
      icon: CalendarRangeIcon,
    },
    {
      value: "daily",
      label: "Daily",
      icon: CalendarFoldIcon,
    },
    {
      value: "pomodoro",
      label: "Pomodoro",
      icon: ClockIcon,
    },
    {
      value: "none",
      label: "None",
      icon: CalendarX2Icon,
    },
  ];

  const eventColumns: ColumnDef<EventType>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ cell }) => {
          const date = new Date(cell.getValue<string>());
          const formatted = format(date, "dd/MM/yy");
          return <div>{formatted}</div>;
        },
      },
      {
        accessorKey: "duration",
        header: "Duration",
        cell: ({ cell }) => {
          return <div>{cell.getValue<string>()} h</div>;
        },
      },
      {
        accessorKey: "recurrencePattern",
        header: "Recurrence Type",
        cell: ({ cell }) => {
          if (cell.getValue()) {
            const pattern = cell.getValue<RecurrenceType>();
            return <div>{pattern.frequency}</div>;
          } else {
            return <div>none</div>;
          }
        },
        filterFn: eventFilter,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const data = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/calendar")}>
                  Open Calendar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(data.title)}
                >
                  Copy Event Title
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [events]
  );

  useEffect(() => {
    // Find pomodoro of the day with same session
    const pomodoro = events.find(
      (e) => moment(e.date).isBefore(currentDate, "day") && e.expiredPomodoro
    );

    if (pomodoro) {
      setPomodoroEvent(pomodoro);

      const currTimerCycles = pomodoro.currPomodoro?.cycles;
      const expectedTimerCycles = pomodoro.expectedPomodoro?.cycles;

      console.log(
        `curr cycles: ${currTimerCycles}, expected cycles: ${expectedTimerCycles}`
      );

      let percentage = 0;

      if (currTimerCycles !== undefined && expectedTimerCycles !== undefined) {
        percentage =
          (expectedTimerCycles - currTimerCycles) / expectedTimerCycles;

        console.log(`cycles percentage: ${percentage}`);

        setPomodoroProgress(percentage);
      }
    }
  }, [events]);

  return (
    <>
      {/* Send message to user Button, aprt from normal document flow */}
      <div className="fixed bottom-14 left-5 z-10">
        <SendMessage />
      </div>

      <div className="view-container grid grid-cols-1 md:grid-cols-3 md:grid-rows-[auto_1fr] gap-5 min-w-fit">

        {/* Pomodoro - su mobile occupa 1 colonna, su desktop tutte e 3 */}
        <div className="col-span-1 md:col-span-3">
          <Card className="bg-popover shadow-lg h-full">
            <CardHeader>
              <CardTitle className="flex w-full justify-between justify-center my-6 text-3xl">
                <NavLink to="/pomodoro">
                  Pomodoro
                </NavLink>
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <CardTitle className="text-center my-6">Last pomodoro session</CardTitle>
                <RadialPomodoroChart progress={pomodoroProgress} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <CardTitle className="text-center my-6">Pomodoro stats</CardTitle>

                <CardContent>
                  <div className="flex flex-col justify-center items-center gap-5 md:flex-row">
                    <div className="flex flex-col justify-center items-center gap-2">
                      <div className="bg-primary h-[200px] w-[200px] md:h-[150px] md:w-[150px] rounded-full flex-center font-bold text-red-50">
                        {(pomodoroEvent?.expectedPomodoro?.study &&
                          Math.floor(pomodoroEvent.expectedPomodoro.study / 60000 * 100) / 100)} min
                      </div>
                      <Badge>Study</Badge>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-2">
                      <div className="bg-[#B982A0] h-[200px] w-[200px] md:h-[150px] md:w-[150px] rounded-full flex-center font-bold text-yellow-50">
                        {(pomodoroEvent?.expectedPomodoro?.relax &&
                          Math.floor(pomodoroEvent.expectedPomodoro.relax / 60000 * 100) / 100)} min
                      </div>
                      <Badge className="bg-[#B982A0]">Relax</Badge>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead colSpan={3} className="w-[100px] text-right">Cycles</TableHead>
                        <TableHead colSpan={2}>Session Length</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Last Session</TableCell>
                        <TableCell colSpan={2} className="font-medium text-right">
                          {pomodoroEvent?.expectedPomodoro?.cycles &&
                            pomodoroEvent?.currPomodoro?.cycles &&
                            pomodoroEvent.expectedPomodoro.cycles -
                            pomodoroEvent.currPomodoro.cycles}
                        </TableCell>
                        <TableCell>
                          {pomodoroEvent?.expectedPomodoro?.study &&
                            pomodoroEvent?.expectedPomodoro?.relax &&
                            pomodoroEvent?.expectedPomodoro?.cycles &&
                            Math.floor(
                              ((pomodoroEvent.expectedPomodoro.study +
                                pomodoroEvent.expectedPomodoro.relax) *
                                pomodoroEvent.expectedPomodoro.cycles /
                                60000) * 100
                            ) / 100} min
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Expected Session</TableCell>
                        <TableCell colSpan={2} className="font-medium text-right">
                          {pomodoroEvent?.expectedPomodoro?.cycles}
                        </TableCell>
                        <TableCell>
                          {pomodoroEvent?.expectedPomodoro?.study &&
                            pomodoroEvent?.expectedPomodoro?.relax &&
                            pomodoroEvent?.expectedPomodoro?.cycles &&
                            Math.floor(
                              ((pomodoroEvent.expectedPomodoro.study +
                                pomodoroEvent.expectedPomodoro.relax) *
                                pomodoroEvent.expectedPomodoro.cycles /
                                60000) * 100
                            ) / 100} min
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={1}>Progress Made</TableCell>
                        <TableCell colSpan={4} className="text-right">
                          {pomodoroProgress * 100}%
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </div>

            </div>
          </Card>
        </div>

        {/* Events */}
        <div className="col-span-1">
          <Card className="bg-popover shadow-lg w-full h-full flex flex-col">
            <CardHeader>
              <CardTitle>
                <NavLink to="/calendar">
                  Events
                </NavLink>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={events}
                columns={eventColumns}
                filterTitleID="title"
                filterColumnID="recurrencePattern"
                filterName="Recurrence"
                filterOptions={frequencies}
              />
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <div className="col-span-1">
          <Card className="bg-popover shadow-lg w-full h-full flex flex-col">
            <CardHeader>
              <CardTitle>
                <NavLink to="/notes">
                  Notes
                </NavLink>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-center md:px-14">
              <Carousel className="w-full max-w-xs">
                <CarouselContent>
                  {notes.length >= 1 ?
                    (notes.map((note) => (
                      <CarouselItem key={note._id}>
                        <NoteCard
                          key={note._id}
                          id={note._id as string}
                          title={note.title}
                          content={note.content}
                          categories={note.categories}
                          createdAt={note.createdAt}
                          updatedAt={note.updatedAt}
                          author={note.author}
                          simplified={true}
                        />
                      </CarouselItem>
                    )))
                    :
                    <div className="text-center ml-4 w-full">
                      No notes
                    </div>}

                </CarouselContent>
                <CarouselPrevious className="max-md:hidden" />
                <CarouselNext className="max-md:hidden" />
              </Carousel>
            </CardContent>
          </Card>
        </div>

        {/* Activities */}
        <div className="col-span-1">
          <Card className="bg-popover shadow-lg w-full h-full flex flex-col">
            <CardHeader>
              <CardTitle>
                <NavLink to="/calendar">
                  Activities
                </NavLink>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTable isInHome={true} />
            </CardContent>
          </Card>
        </div>
      </div>

    </>
  );
}
