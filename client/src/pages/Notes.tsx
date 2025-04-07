import { useEffect, useMemo, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import NoteCard from "@/components/editor/notecard";
import { useNoteContext } from "@/context/NoteContext";
import useNotes from "@/hooks/useNote";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { NoteType } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Plus, Trash, SortAsc, Eye, EyeOff } from "lucide-react"; // Importa le icone

function HomeNote() {
  const { notes } = useNoteContext();
  const { fetchNotes, deleteAllNotes } = useNotes();
  const { user } = useAuth();
  const [sortOption, setSortOption] = useState<string>("default");
  const [showOnlyOwnNotes, setShowOnlyOwnNotes] = useState(false);
  const navigate = useNavigate();

  const loadNotes = useCallback(async () => {
    try {
      await fetchNotes();
    } catch (error) {
      console.error(
        "Errore nel caricamento delle note:",
        error instanceof Error ? error.message : "Errore sconosciuto"
      );
    }
  }, [fetchNotes]);

  useEffect(() => {
    loadNotes();
  }, []);

  const sortedNotes = useMemo(() => {
    const sortNotes = (notes: NoteType[], option: string): NoteType[] => {
      return [...notes].sort((a, b) => {
        switch (option) {
          case "title":
            return a.title.localeCompare(b.title);
          case "date": {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          }
          case "length":
            return b.content.length - a.content.length;
          default:
            return 0;
        }
      });
    };
    return sortNotes(notes, sortOption);
  }, [notes, sortOption]);

  const filteredNotes = useMemo(() => {
    return showOnlyOwnNotes
      ? sortedNotes.filter((note) => note.author === user?.username)
      : sortedNotes;
  }, [sortedNotes, showOnlyOwnNotes, user]);

  const handleCreateNewNote = () => {
    navigate("/editor");
  };

  const handleDeleteAllNotes = async () => {
    try {
      await deleteAllNotes();
    } catch (error) {
      console.error(
        "Errore nell'eliminazione delle note:",
        error instanceof Error ? error.message : "Errore sconosciuto"
      );
    }
  };

  const handleSortChange = (option: string) => {
    setSortOption(option);
  };

  const toggleShowOwnNotes = () => {
    setShowOnlyOwnNotes((prev) => !prev);
  };

  return (
    <div className="view-container p-4">
      <div className="flex justify-start items-center space-x-2 mb-4">
        <Button
          onClick={handleCreateNewNote}
          aria-label="Crea una nuova nota"
          className="p-2 sm:p-4"
        >
          <span className="block sm:hidden" aria-hidden="true">
            <Plus className="w-5 h-5" />
          </span>
          <span className="hidden sm:block">New note</span>
        </Button>
        <Button
          onClick={handleDeleteAllNotes}
          aria-label="Delete all notes"
          className="p-2 sm:p-4"
        >
          <span className="block sm:hidden" aria-hidden="true">
            <Trash className="w-5 h-5" />
          </span>
          <span className="hidden sm:block">Delete all notes</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-haspopup="true"
              aria-expanded="false"
              aria-label="Sort notes"
              className="p-2 sm:p-4"
            >
              <span className="block sm:hidden" aria-hidden="true">
                <SortAsc className="w-5 h-5" />
              </span>
              <span className="hidden sm:block">Sort notes by</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => handleSortChange("title")}
              aria-label="Sort by title"
            >
              Title
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange("date")}
              aria-label="Sort by date"
            >
              Date
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortChange("length")}
              aria-label="Sort by length"
            >
              Length
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={toggleShowOwnNotes}
          aria-label={
            showOnlyOwnNotes
              ? "Mostra tutte le note"
              : "Mostra solo le tue note"
          }
          className="p-2 sm:p-4"
        >
          {showOnlyOwnNotes ? (
            <>
              <span className="block sm:hidden" aria-hidden="true">
                <EyeOff className="w-5 h-5" />
              </span>
              <span className="hidden sm:block">Show all notes</span>
            </>
          ) : (
            <>
              <span className="block sm:hidden" aria-hidden="true">
                <Eye className="w-5 h-5" />
              </span>
              <span className="hidden sm:block">Show my notes</span>
            </>
          )}
        </Button>
      </div>

      <div className="note-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              id={note._id as string}
              title={note.title}
              content={note.content}
              categories={note.categories}
              createdAt={note.createdAt}
              updatedAt={note.updatedAt}
              author={note.author}
              simplified={false}
            />
          ))
        ) : (
          <p aria-live="polite">There are no notes. Create a new one!</p>
        )}
      </div>
    </div>
  );
}

export default HomeNote;
