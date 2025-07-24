import RelaxAnimation from "@/components/timer/RelaxAnimation";
import StudyAnimation from "@/components/timer/StudyAnimation";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/useTimer";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PomodoroForm from "@/components/timer/PomodoroForm";
import usePushNotification, {
  NotificationPayload,
} from "@/hooks/usePushNotification";
import { useAuth } from "@/context/AuthContext";
import { BlockerFunction, useBlocker } from "react-router-dom";
import useEventsApi from "@/hooks/useEventsApi";
import { useEvents } from "@/context/EventContext";
import { useTimeMachineContext } from "@/context/TimeMachine";
import moment from "moment";
import { client_log, EventType } from "@/lib/utils";
import { CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronLast, Play, RotateCcwIcon, SkipForward } from "lucide-react";

export default function Pomodoro() {
  const { RequestPushSub, sendNotification } = usePushNotification();
  const { user } = useAuth();
  const { events } = useEvents();
  const { postEvent, updateEvent } = useEventsApi();
  const { timer, dispatch, InitialTimer, setInitialTimer } = useTimer();
  const { currentDate } = useTimeMachineContext();
  const [open, setOpen] = useState(false);
  const [pomodoroEvent, setPomodoroEvent] = useState<EventType | null>(null);
  const [pomodoroProgress, setPomodoroProgress] = useState(0);
  const [session, setPomodoroSession] = useState<EventType | undefined>(
    undefined
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

  // Block navigating elsewhere when data has been entered into the input
  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      timer.study.started &&
      timer.relax.started &&
      currentLocation.pathname !== nextLocation.pathname,
    [timer.relax.started, timer.study.started]
  );
  const blocker = useBlocker(shouldBlock);

  const remainder = useRef((timer.study.initialValue / 1000) % 5);
  const repetitions = useRef(
    (timer.study.initialValue / 1000 - remainder.current) / 10
  );
  const timeDiff = useRef(timer.study.value);

  async function start() {
    // Set the initial timer correctly in case we didn't set the pomodoro session with the forms
    setInitialTimer(timer);

    dispatch({
      type: "START",
      payload: null,
    });

    // Find pomodoro of the day with same session
    let todaysPomodoro = events.find(
      (e) =>
        moment(e.date).isSame(currentDate, "day") &&
        e.currPomodoro?.study === timer.study.initialValue &&
        e.currPomodoro?.relax === timer.relax.initialValue &&
        !e.expiredPomodoro
    );

    const pomodoro = {
      study: timer.study.initialValue,
      relax: timer.relax.initialValue,
      cycles: timer.cycles,
    };
    // Minutes for pomodoro event
    const mins = Math.floor(timer.totalTime / 60000);

    if (!todaysPomodoro) {
      const newPomodoroEvent: EventType = {
        itsPomodoro: true,
        date: currentDate.toISOString(),
        hours: 0,
        minutes: mins,
        isRecurring: false,
        title: "Pomodoro",
        currPomodoro: pomodoro,
        expectedPomodoro: pomodoro,
        groupList: [],
        expiredPomodoro: false,
      };
      // crea il nuovo evento pomodoro di oggi
      todaysPomodoro = await postEvent(newPomodoroEvent);
    }

    // Todays Pomodoro exists but number of cycles of selected session is greater
    if (
      todaysPomodoro?.expectedPomodoro?.cycles &&
      todaysPomodoro?.currPomodoro?.cycles &&
      timer.cycles > todaysPomodoro.expectedPomodoro?.cycles
    ) {
      // Add leftover cycles to todays pomodoro
      todaysPomodoro.currPomodoro.cycles +=
        timer.cycles - todaysPomodoro.expectedPomodoro.cycles;
      todaysPomodoro.expectedPomodoro.cycles = timer.cycles;

      await updateEvent(todaysPomodoro);
    }

    setPomodoroSession(todaysPomodoro);

    client_log("Pomodoro: ", todaysPomodoro);
  }

  function reset() {
    dispatch({
      type: "SET",
      payload: InitialTimer,
    });
    setPomodoroSession(undefined);
  }

  function restartStudy() {
    dispatch({
      type: "RESTART",
      payload: null,
    });

    remainder.current = (timer.study.initialValue / 1000) % 5;
    repetitions.current =
      (timer.study.initialValue / 1000 - remainder.current) / 10;
    timeDiff.current = timer.study.initialValue;

    const pulse1 = document.getElementById("pulse1");
    if (pulse1) {
      pulse1.style.animation = "none";
      pulse1.offsetHeight; // read-only property to trigger a reflow
      pulse1.style.animation = "";
      pulse1.style.animationIterationCount = `${repetitions.current}`;
      pulse1.style.animationPlayState = timer.study.started
        ? "running"
        : "paused";
    }

    const pulse2 = document.getElementById("pulse2");
    if (pulse2) {
      pulse2.style.animation = "none";
      pulse2.offsetHeight; // read-only property to trigger a reflow
      pulse2.style.animation = "";
      pulse2.style.animationIterationCount = `${repetitions.current}`;
      pulse2.style.animationPlayState = timer.study.started
        ? "running"
        : "paused";
    }

    const progressbar = document.getElementById("progbar");
    if (progressbar) {
      progressbar.style.animation = "none";
      progressbar.offsetHeight; // read-only property to trigger a reflow
      progressbar.style.animation = "";
      progressbar.style.animationDuration = `${timeDiff.current}ms`;
      progressbar.style.animationIterationCount = "1";
      progressbar.style.animationPlayState = timer.study.started
        ? "running"
        : "paused";
    }

    const orbit = document.getElementById("orbit");
    if (orbit) {
      orbit.style.animation = "none";
      orbit.offsetHeight; // read-only property to trigger a reflow
      orbit.style.animation = "";
      orbit.style.animationDuration = `${timeDiff.current}ms`;
      orbit.style.animationIterationCount = "1";
      orbit.style.animationPlayState = timer.study.started
        ? "running"
        : "paused";
    }
  }

  function restartRelax() {
    remainder.current = (timer.relax.initialValue / 1000) % 5;
    repetitions.current =
      (timer.relax.initialValue / 1000 - remainder.current) / 10;
    timeDiff.current = timer.relax.initialValue;

    const sunbar = document.getElementById("sunbar");
    if (sunbar) {
      sunbar.style.animation = "none";
      sunbar.offsetHeight; // read-only property to trigger a reflow
      sunbar.style.animation = "";
      sunbar.style.animationDuration = `${timeDiff.current}ms`;
      sunbar.style.animationIterationCount = "1";
      sunbar.style.animationPlayState = timer.relax.started
        ? "running"
        : "paused";
    }
  }

  useEffect(() => {
    if (blocker.state === "blocked") {
      setOpen(true);
    }
  }, [blocker.state]);

  // send a notification every time we start next phase
  useEffect(() => {
    const payload: NotificationPayload = {
      title: "Pomodoro Timer",
      body: timer.isStudyCycle ? "Study timer started" : "Relax timer started",
      url: `${window.origin}/pomodoro`,
    };

    const userID = user?._id;

    if (
      userID &&
      timer.study.started &&
      timer.relax.started &&
      timer.cycles > 0
    )
      RequestPushSub(() => sendNotification(userID, payload));
  }, [timer.isStudyCycle]);

  // Session FINISHED
  useEffect(() => {
    // UPDATE todays pomodoro cycles
    if (session?._id && session?.currPomodoro?.cycles) {
      session.currPomodoro.cycles = timer.cycles;
      updateEvent(session);

      console.log("cycles: ", timer.cycles);
    }

    const payload: NotificationPayload = {
      title: "Pomodoro Timer",
      body: "Pomodoro session finished!",
      url: `${window.origin}/pomodoro`,
    };

    const userID = user?._id;

    if (userID && timer.cycles === 0 && timer.relax.started) {
      RequestPushSub(() => sendNotification(userID, payload));
    }
  }, [timer.cycles]);

  return (
    <div>
      <div className="my-4">
        <h1 className="text-center text-primary font-bold my-4">Pomodoro</h1>
        <div className="flex-center justify-start flex-col gap-5 my-6 sm:my-0">
          <p className="leading-6">
            Organize your pomodoro session with:
          </p>
          <ul className="list-disc small-regular sm:base-regular px-6">
            <li className="leading-6">
              <b>timers</b>: set study timer, pause timer and number of cycles;
            </li>
            <li className="leading-6">
              <b>session</b>: set session time and choose the best option for your needs.
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <div className="grid mg:grid-cols-1 xl:grid-cols-12 gap-5 min-w-fit max-w-max">

          <div className="col-span-4 my-12">
            {/* Forms */}
            {!timer.study.started && (
              <PomodoroForm
                timer={timer}
                dispatch={dispatch}
                InitialTimer={InitialTimer}
                setInitialTimer={setInitialTimer}
              />
            )}
          </div>
          <div className="col-span-4 my-12">
            <div className="flex-center flex-col gap-5 z-10">
              <h2>{timer.cycles} cycles</h2>

              {timer.isStudyCycle ? (
                <StudyAnimation
                  timer={timer}
                  dispatch={dispatch}
                  remainder={remainder}
                  repetitions={repetitions}
                  timeDiff={timeDiff}
                />
              ) : (
                <RelaxAnimation
                  timer={timer}
                  dispatch={dispatch}
                  remainder={remainder}
                  repetitions={repetitions}
                  timeDiff={timeDiff}
                />
              )}

              {/* Buttons */}
              <div className="flex-center gap-5">
                <TooltipProvider>
                  {(!timer.study.started || !timer.relax.started) &&
                    timer.totalTime > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => {
                              start();

                              const payload: NotificationPayload = {
                                title: "Pomodoro Timer",
                                body: "Pomodoro session started",
                                url: `${window.origin}/pomodoro`,
                              };

                              const userID = user?._id;

                              if (
                                userID &&
                                timer.totalTime === InitialTimer.totalTime &&
                                !timer.study.started
                              )
                                RequestPushSub(() =>
                                  sendNotification(userID, payload)
                                );
                            }}
                          >
                            <Play />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Start Timer</TooltipContent>
                      </Tooltip>
                    )}

                  {timer.study.started && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() =>
                            timer.totalTime === 0 ? reset() : restartStudy()
                          }
                        >
                          <RotateCcwIcon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {timer.totalTime === 0 ? "Restart Session" : "Restart Cycle"}
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {timer.study.started && timer.totalTime > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            dispatch({
                              type: "SKIP",
                              payload: null,
                            });
                            restartRelax();
                          }}
                        >
                          <SkipForward />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Skip this timer</TooltipContent>
                    </Tooltip>
                  )}

                  {/* Show only when we are not in the last cycle study timer */}
                  {timer.cycles > 0 && timer.study.started && (
                    <Tooltip>
                      <TooltipContent>Skip this cycle</TooltipContent>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => {
                            dispatch({ type: "SKIPCYCLE", payload: null });
                            remainder.current = (timer.study.initialValue / 1000) % 5;
                            repetitions.current =
                              (timer.study.initialValue / 1000 - remainder.current) /
                              10;
                            timeDiff.current = timer.study.initialValue;

                            const pulse1 = document.getElementById("pulse1");
                            if (pulse1) {
                              pulse1.style.animation = "none";
                              pulse1.offsetHeight; // read-only property to trigger a reflow
                              pulse1.style.animation = "";
                              pulse1.style.animationIterationCount = `${repetitions.current}`;
                              pulse1.style.animationPlayState = timer.study.started
                                ? "running"
                                : "paused";
                            }

                            const pulse2 = document.getElementById("pulse2");
                            if (pulse2) {
                              pulse2.style.animation = "none";
                              pulse2.offsetHeight; // read-only property to trigger a reflow
                              pulse2.style.animation = "";
                              pulse2.style.animationIterationCount = `${repetitions.current}`;
                              pulse2.style.animationPlayState = timer.study.started
                                ? "running"
                                : "paused";
                            }

                            const progressbar = document.getElementById("progbar");
                            if (progressbar) {
                              progressbar.style.animation = "none";
                              progressbar.offsetHeight; // read-only property to trigger a reflow
                              progressbar.style.animation = "";
                              progressbar.style.animationDuration = `${timeDiff.current}ms`;
                              progressbar.style.animationIterationCount = "1";
                              progressbar.style.animationPlayState = timer.study
                                .started
                                ? "running"
                                : "paused";
                            }

                            const orbit = document.getElementById("orbit");
                            if (orbit) {
                              orbit.style.animation = "none";
                              orbit.offsetHeight; // read-only property to trigger a reflow
                              orbit.style.animation = "";
                              orbit.style.animationDuration = `${timeDiff.current}ms`;
                              orbit.style.animationIterationCount = "1";
                              orbit.style.animationPlayState = timer.study.started
                                ? "running"
                                : "paused";
                            }
                          }}
                        >
                          <ChevronLast />
                        </Button>
                      </TooltipTrigger>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            </div>
          </div>
          <div className="col-span-4 my-12">
            {!timer.study.started && (
              <>
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
                        {/* <TableHead colSpan={3} className="w-[100px] text-right">Cycles</TableHead>
                  <TableHead colSpan={2}>Session Length</TableHead> */}
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
              </>
            )}
          </div>
        </div>
      </div>
      <div className="view-container flex justify-center flex-col gap-5 md:flex-row sm:items-center mb-10">



        {/* Dialog Window */}
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                All non-completed cycles will be automatically added to your next
                pomodoro session.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  if (blocker.state === "blocked") blocker.reset();
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (blocker.state === "blocked") {
                    localStorage.removeItem("pomodoro_timer");
                    blocker.proceed();
                  }
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
