import { useState, useEffect } from "react";
import { toast } from "sonner";
import { HiSparkles, HiKey, HiLink, HiEyeSlash } from "react-icons/hi2";
import { settingsApi, Setting } from "@/utils/api/settingsApi";
import api from "@/lib/api";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ActionButton from "../common/ActionButton";
import { HiCog, HiEye } from "react-icons/hi";

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load settings when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings: Setting[] = await settingsApi.getAll("ai");

      settings.forEach((setting) => {
        switch (setting.key) {
          case "ai_enabled":
            const enabled = setting.value === "true";
            setIsEnabled(enabled);
            localStorage.setItem("aiEnabled", enabled.toString());
            window.dispatchEvent(
              new CustomEvent("aiSettingsChanged", {
                detail: { aiEnabled: enabled },
              })
            );
            break;
          case "ai_api_key":
            setApiKey(setting.value || "");
            break;
          case "ai_model":
            setModel(setting.value || "deepseek/deepseek-chat-v3-0324:free");
            break;
          case "ai_api_url":
            setApiUrl(setting.value || "https://openrouter.ai/api/v1");
            break;
        }
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
      setMessage({ type: "error", text: "Error al cargar la configuración de IA" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Use bulk save to make a single API call instead of 4 separate calls
      await settingsApi.bulkSetSettings([
        {
          key: "ai_enabled",
          value: isEnabled.toString(),
          description: "Enable/disable AI chat functionality",
          category: "ai",
          isEncrypted: false,
        },
        {
          key: "ai_api_key",
          value: apiKey,
          description: "AI provider API key",
          category: "ai",
          isEncrypted: true,
        },
        {
          key: "ai_model",
          value: model,
          description: "AI model to use",
          category: "ai",
          isEncrypted: false,
        },
        {
          key: "ai_api_url",
          value: apiUrl,
          description: "API endpoint URL",
          category: "ai",
          isEncrypted: false,
        },
      ]);

      localStorage.setItem("aiEnabled", isEnabled.toString());
      window.dispatchEvent(
        new CustomEvent("aiSettingsChanged", {
          detail: { aiEnabled: isEnabled },
        })
      );

      setMessage({ type: "success", text: "¡Configuración de IA guardada con éxito!" });
      toast.success("¡Configuración de IA guardada con éxito!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMessage({ type: "error", text: "Error al guardar la configuración de IA" });
      toast.error("Error al guardar la configuración de IA");
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    if (!apiKey) {
      setMessage({ type: "error", text: "Por favor, ingrese una clave API primero" });
      return;
    }

    if (!model) {
      setMessage({ type: "error", text: "Por favor, ingrese un nombre de modelo primero" });
      return;
    }

    if (!apiUrl) {
      setMessage({ type: "error", text: "Por favor, ingrese una URL de API primero" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Use the new test-connection endpoint that doesn't require AI to be enabled
      const response = await api.post("/ai-chat/test-connection", {
        apiKey,
        model,
        apiUrl,
      });

      if (response.data.success) {
        setMessage({ type: "success", text: response.data.message || "¡Prueba de conexión exitosa!" });
        toast.success(response.data.message || "¡Prueba de conexión exitosa!");
      } else {
        const errorMsg = response.data.error || "La prueba de conexión falló";
        setMessage({
          type: "error",
          text: errorMsg,
        });
        toast.error(errorMsg);
      }
    } catch (error: any) {
      console.error("Connection test failed:", error);
      const errorMessage = error.response?.data?.error || error.message || "La prueba de conexión falló";
      setMessage({ type: "error", text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessage(null);
    onClose();
  };

  const isFormValid = isEnabled
    ? apiKey.trim().length > 0 && model.trim().length > 0 && apiUrl.trim().length > 0
    : true;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="projects-modal-container min-w-[40vw] border-none ">
        <DialogHeader className="projects-modal-header">
          <div className="projects-modal-header-content">
            <div className="projects-modal-icon bg-[var(--primary)]">
              <HiSparkles className="projects-modal-icon-content" />
            </div>
            <div className="projects-modal-info">
              <DialogTitle className="projects-modal-title">Configuración del Asistente de IA</DialogTitle>
              <p className="projects-modal-description">
                Configure la funcionalidad de chat de IA y los ajustes de la API
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          {/* Configuration Fields - Always visible */}
          {/* API Key */}
          <div className="space-y-2">
            <Label
              htmlFor="api-key"
              className="projects-form-label text-sm"
              style={{ fontSize: "14px" }}
            >
              <HiKey
                className="projects-form-label-icon size-3"
                style={{ color: "hsl(var(--primary))" }}
              />
              Clave API <span className="projects-form-label-required">*</span>
            </Label>

            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingrese su clave API"
                disabled={isLoading || isSaving}
                className="projects-form-input border-none pr-8"
                style={{ borderColor: "var(--border)" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "hsl(var(--primary))";
                  e.target.style.boxShadow = `0 0 0 3px hsl(var(--primary) / 0.2)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />

              <button
                type="button"
                onClick={() => setShowApiKey((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-[hsl(var(--primary))] transition-colors"
                tabIndex={-1}
              >
                {showApiKey ? <HiEyeSlash className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model */}
          <div className="space-y-1">
            <Label
              htmlFor="model"
              className="projects-form-label text-sm"
              style={{ fontSize: "14px" }}
            >
              <HiCog
                className="projects-form-label-icon"
                style={{ color: "hsl(var(--primary))" }}
              />
              Modelo <span className="projects-form-label-required">*</span>
            </Label>
            <Input
              id="model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="ej., deepseek/deepseek-chat-v3-0324:free"
              disabled={isLoading || isSaving}
              className="projects-form-input border-none"
              style={{ borderColor: "var(--border)" }}
              onFocus={(e) => {
                e.target.style.borderColor = "hsl(var(--primary))";
                e.target.style.boxShadow = `0 0 0 3px hsl(var(--primary) / 0.2)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* API URL */}
          <div className="space-y-1">
            <Label
              htmlFor="api-url"
              className="projects-form-label text-sm"
              style={{ fontSize: "14px" }}
            >
              <span className="projects-form-label-icon flex items-center justify-center stroke-[var(--primary)]">
                <HiLink
                  style={{
                    color: "hsl(var(--primary))",
                    width: "1.25em",
                    height: "1.25em",
                  }}
                />
              </span>
              URL de la API <span className="projects-form-label-required">*</span>
            </Label>
            <Input
              id="api-url"
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.provider.com/v1"
              disabled={isLoading || isSaving}
              className="projects-form-input border-none"
              style={{ borderColor: "var(--border)" }}
              onFocus={(e) => {
                e.target.style.borderColor = "hsl(var(--primary))";
                e.target.style.boxShadow = `0 0 0 3px hsl(var(--primary) / 0.2)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <div className="projects-form-field">
            <div className="flex  items-center justify-between p-4 bg-[var(--mini-sidebar)] rounded-lg ">
              <div>
                <Label
                  className="projects-form-label border-none text-sm"
                  style={{ fontSize: "14px" }}
                >
                  <HiSparkles
                    className="projects-form-label-icon"
                    style={{ color: "hsl(var(--primary))" }}
                  />
                  Habilitar Chat de IA
                </Label>
                <p className="projects-url-preview-label text-[13px] mt-1 ml-6">
                  Complete todos los campos para habilitar el chat.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setIsEnabled(newValue);
                  }}
                  disabled={
                    isLoading || isSaving || !apiKey.trim() || !model.trim() || !apiUrl.trim()
                  }
                  className="sr-only peer"
                />
                <div
                  className="w-11 h-6 rounded-full peer-focus:outline-none peer relative
                    bg-[var(--status-inactive-bg)] peer-checked:bg-[var(--primary)]
                    peer peer-checked:after:translate-x-5 peer-checked:after:border-white
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--background)] after:rounded-full after:h-5 after:w-5 after:transition-all"
                ></div>
              </label>
            </div>
          </div>

          {/* Setup Guide & Providers - Always visible */}

          <div className="mt-4 p-3 bg-[var(--border)] rounded-lg">
            <h3 className="projects-url-preview-label mb-2 text-[14px]">Proveedores de IA Populares:</h3>
            <ul
              className="text-xs space-y-1 text-[var(--accent-foreground)]"
              style={{ fontSize: "13px" }}
            >
              <li>
                • <strong>OpenRouter:</strong> https://openrouter.ai/api/v1 (más de 100 modelos, opciones gratuitas disponibles)
              </li>
              <li>
                • <strong>OpenAI:</strong> https://api.openai.com/v1 (modelos GPT)
              </li>
              <li>
                • <strong>Anthropic:</strong> https://api.anthropic.com/v1 (modelos Claude)
              </li>
              <li>
                • <strong>Google:</strong> https://generativelanguage.googleapis.com/v1beta (modelos Gemini)
              </li>
            </ul>
            <p className="text-xs" style={{ fontSize: "13px" }}>
              • Las claves API están encriptadas y se almacenan de forma segura • Pruebe la conexión después de los cambios • La URL determina qué proveedor se utiliza
            </p>
          </div>

          {/* Action Buttons */}
          <div className="projects-form-actions flex gap-2 justify-end mt-6">
            <ActionButton
              type="button"
              secondary
              onClick={handleClose}
              disabled={isLoading || isSaving}
            >
              Cancelar
            </ActionButton>

            <ActionButton
              type="button"
              onClick={testConnection}
              disabled={isLoading || isSaving || !apiKey.trim() || !model.trim() || !apiUrl.trim()}
              variant="outline"
              secondary
            >
              {isLoading ? "Probando..." : "Probar Conexión"}
            </ActionButton>

            <ActionButton
              type="button"
              primary
              onClick={handleSave}
              disabled={isSaving || !isFormValid}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : (
                "Guardar Configuración"
              )}
            </ActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
