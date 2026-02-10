import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit2,
  Save,
  X,
} from "lucide-react";

export interface ProficiencyLevel {
  level: string;
  points: number;
}

export interface JobRequirement {
  id?: number;
  title: string;
  description?: string;
  category: "hard_skill" | "soft_skill" | "administrative";
  requirementType: "mandatory" | "desirable";
  weight: number;
  proficiencyLevels: ProficiencyLevel[];
  order: number;
}

interface RequirementsManagerProps {
  requirements: JobRequirement[];
  onChange: (requirements: JobRequirement[]) => void;
}

export function RequirementsManager({ requirements, onChange }: RequirementsManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingRequirement, setEditingRequirement] = useState<JobRequirement | null>(null);
  const [editingLevelIndex, setEditingLevelIndex] = useState<number | null>(null);

  const categoryLabels = {
    hard_skill: "Hard Skill",
    soft_skill: "Soft Skill",
    administrative: "Administrativa",
  };

  const typeLabels = {
    mandatory: "Obrigatório",
    desirable: "Desejável",
  };

  const handleAddRequirement = () => {
    const newRequirement: JobRequirement = {
      title: "",
      description: "",
      category: "hard_skill",
      requirementType: "desirable",
      weight: 3,
      proficiencyLevels: [
        { level: "Básico", points: 1 },
        { level: "Intermediário", points: 3 },
        { level: "Avançado", points: 5 },
      ],
      order: requirements.length,
    };

    setEditingRequirement(newRequirement);
    setEditingIndex(requirements.length);
  };

  const handleSaveRequirement = () => {
    if (!editingRequirement || editingIndex === null) return;

    if (!editingRequirement.title.trim()) {
      alert("O título do requisito é obrigatório");
      return;
    }

    if (editingRequirement.proficiencyLevels.length === 0) {
      alert("Adicione ao menos um nível de proficiência");
      return;
    }

    const newRequirements = [...requirements];
    if (editingIndex < requirements.length) {
      newRequirements[editingIndex] = editingRequirement;
    } else {
      newRequirements.push(editingRequirement);
    }

    onChange(newRequirements);
    setEditingRequirement(null);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingRequirement(null);
    setEditingIndex(null);
    setEditingLevelIndex(null);
  };

  const handleEditRequirement = (index: number) => {
    setEditingRequirement({ ...requirements[index] });
    setEditingIndex(index);
  };

  const handleDeleteRequirement = (index: number) => {
    if (confirm("Deseja realmente excluir este requisito?")) {
      const newRequirements = requirements.filter((_, i) => i !== index);
      onChange(newRequirements.map((req, i) => ({ ...req, order: i })));
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newRequirements = [...requirements];
    [newRequirements[index - 1], newRequirements[index]] = [
      newRequirements[index],
      newRequirements[index - 1],
    ];
    onChange(newRequirements.map((req, i) => ({ ...req, order: i })));
  };

  const handleMoveDown = (index: number) => {
    if (index === requirements.length - 1) return;
    const newRequirements = [...requirements];
    [newRequirements[index], newRequirements[index + 1]] = [
      newRequirements[index + 1],
      newRequirements[index],
    ];
    onChange(newRequirements.map((req, i) => ({ ...req, order: i })));
  };

  const handleAddLevel = () => {
    if (!editingRequirement) return;
    const newLevel: ProficiencyLevel = { level: "", points: 1 };
    setEditingRequirement({
      ...editingRequirement,
      proficiencyLevels: [...editingRequirement.proficiencyLevels, newLevel],
    });
    setEditingLevelIndex(editingRequirement.proficiencyLevels.length);
  };

  const handleUpdateLevel = (index: number, field: "level" | "points", value: string | number) => {
    if (!editingRequirement) return;
    const newLevels = [...editingRequirement.proficiencyLevels];
    newLevels[index] = {
      ...newLevels[index],
      [field]: field === "points" ? parseInt(value as string) || 0 : value,
    };
    setEditingRequirement({
      ...editingRequirement,
      proficiencyLevels: newLevels,
    });
  };

  const handleDeleteLevel = (index: number) => {
    if (!editingRequirement) return;
    const newLevels = editingRequirement.proficiencyLevels.filter((_, i) => i !== index);
    setEditingRequirement({
      ...editingRequirement,
      proficiencyLevels: newLevels,
    });
    if (editingLevelIndex === index) {
      setEditingLevelIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Requisitos da Vaga</Label>
        <Button
          type="button"
          onClick={handleAddRequirement}
          variant="outline"
          size="sm"
          data-testid="button-add-requirement"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Requisito
        </Button>
      </div>

      {requirements.length === 0 && editingIndex === null && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum requisito adicionado. Clique em "Adicionar Requisito" para começar.
        </p>
      )}

      {/* Lista de requisitos */}
      {requirements.map((req, index) => (
        editingIndex === index ? null : (
          <Card key={index} className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{req.title}</h4>
                    <Badge variant={req.requirementType === "mandatory" ? "destructive" : "secondary"}>
                      {typeLabels[req.requirementType]}
                    </Badge>
                    <Badge variant="outline">
                      {categoryLabels[req.category]}
                    </Badge>
                    {req.requirementType === "desirable" && (
                      <Badge variant="default">
                        Peso: {req.weight}
                      </Badge>
                    )}
                  </div>
                  {req.description && (
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {req.proficiencyLevels.map((level, levelIndex) => (
                      <Badge key={levelIndex} variant="outline" className="text-xs">
                        {level.level}: {level.points} pts
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === requirements.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditRequirement(index)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRequirement(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      ))}

      {/* Formulário de edição */}
      {editingRequirement !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingIndex! < requirements.length ? "Editar" : "Novo"} Requisito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="req-title">Título *</Label>
              <Input
                id="req-title"
                value={editingRequirement.title}
                onChange={(e) => setEditingRequirement({
                  ...editingRequirement,
                  title: e.target.value,
                })}
                placeholder="Ex: JavaScript, Liderança, Experiência mínima"
                data-testid="input-requirement-title"
              />
            </div>

            <div>
              <Label htmlFor="req-description">Descrição</Label>
              <Textarea
                id="req-description"
                value={editingRequirement.description || ""}
                onChange={(e) => setEditingRequirement({
                  ...editingRequirement,
                  description: e.target.value,
                })}
                placeholder="Descrição detalhada do requisito..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={editingRequirement.requirementType}
                  onValueChange={(value: "mandatory" | "desirable") => setEditingRequirement({
                    ...editingRequirement,
                    requirementType: value,
                  })}
                >
                  <SelectTrigger data-testid="select-requirement-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mandatory">Obrigatório (Corte)</SelectItem>
                    <SelectItem value="desirable">Desejável (Pontuação)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categoria *</Label>
                <Select
                  value={editingRequirement.category}
                  onValueChange={(value: "hard_skill" | "soft_skill" | "administrative") => setEditingRequirement({
                    ...editingRequirement,
                    category: value,
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hard_skill">Hard Skill</SelectItem>
                    <SelectItem value="soft_skill">Soft Skill</SelectItem>
                    <SelectItem value="administrative">Administrativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingRequirement.requirementType === "desirable" && (
                <div>
                  <Label>Peso (1-5) *</Label>
                  <Select
                    value={editingRequirement.weight.toString()}
                    onValueChange={(value) => setEditingRequirement({
                      ...editingRequirement,
                      weight: parseInt(value),
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((w) => (
                        <SelectItem key={w} value={w.toString()}>
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Níveis de Proficiência *</Label>
                <Button
                  type="button"
                  onClick={handleAddLevel}
                  variant="outline"
                  size="sm"
                  data-testid="button-add-level"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Nível
                </Button>
              </div>

              {editingRequirement.proficiencyLevels.map((level, levelIndex) => (
                <div key={levelIndex} className="flex gap-2">
                  <Input
                    value={level.level}
                    onChange={(e) => handleUpdateLevel(levelIndex, "level", e.target.value)}
                    placeholder="Nível (Ex: Básico)"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={level.points}
                    onChange={(e) => handleUpdateLevel(levelIndex, "points", e.target.value)}
                    placeholder="Pontos"
                    className="w-24"
                    min={0}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLevel(levelIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {editingRequirement.proficiencyLevels.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum nível adicionado. Clique em "Adicionar Nível" para começar.
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveRequirement}
                data-testid="button-save-requirement"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Requisito
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
