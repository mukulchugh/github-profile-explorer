import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useViewControl } from "@/hooks/use-view-control";
import { IconGitCompare, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

interface CompareSectionProps {
  onCompare?: (usernames: string[]) => void;
}

export function CompareSection({ onCompare }: CompareSectionProps) {
  const [userInputs, setUserInputs] = useState<string[]>(["", ""]);
  const { setCompareUsernames } = useViewControl();

  const handleAddUser = () => {
    if (userInputs.length < 4) {
      setUserInputs([...userInputs, ""]);
    }
  };

  const handleRemoveUser = (index: number) => {
    if (userInputs.length > 2) {
      const newInputs = [...userInputs];
      newInputs.splice(index, 1);
      setUserInputs(newInputs);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const handleCompare = () => {
    const validUsernames = userInputs.filter((username) => username.trim() !== "");
    if (validUsernames.length < 2) {
      return;
    }
    setCompareUsernames(validUsernames);
    onCompare?.(validUsernames);
  };

  const canCompare = userInputs.filter((u) => u.trim()).length >= 2;

  return (
    <div className="space-y-6">
      <EmptyState
        icon={IconGitCompare}
        title="Compare GitHub Profiles"
        description="Enter GitHub usernames to compare their statistics and activity"
        className="min-h-[150px] py-6"
      />

      <Card>
        <CardHeader className="pb-3 flex-row justify-between items-center">
          <h3 className="text-lg font-semibold">Enter GitHub Usernames</h3>

          {userInputs.length < 4 && (
            <Button variant="outline" size="icon" className="gap-1" onClick={handleAddUser}>
              <IconPlus className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {userInputs.map((input, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`GitHub Username ${index + 1}`}
                value={input}
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
              {userInputs.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleRemoveUser(index)}
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <div className="pt-2">
            <Button
              disabled={!canCompare}
              className="w-full"
              onClick={handleCompare}
              size={"default"}
            >
              <IconGitCompare className="h-4 w-4" />
              Compare
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
