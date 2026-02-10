import { useRef, useImperativeHandle, forwardRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SignaturePadRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: (type?: string, encoderOptions?: number) => string;
  toData: () => any;
  fromDataURL: (base64String: string, options?: any) => void;
}

interface SignaturePadProps {
  onSave?: (signature: string) => void;
  className?: string;
  canvasClassName?: string;
  height?: number;
  width?: number;
  disabled?: boolean;
  showClearButton?: boolean;
  placeholder?: string;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  (
    {
      onSave,
      className,
      canvasClassName,
      height = 200,
      width,
      disabled = false,
      showClearButton = true,
      placeholder = "Assine aqui",
    },
    ref
  ) => {
    const sigCanvas = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigCanvas.current?.clear();
      },
      isEmpty: () => {
        return sigCanvas.current?.isEmpty() ?? true;
      },
      toDataURL: (type?: string, encoderOptions?: number) => {
        return sigCanvas.current?.toDataURL(type, encoderOptions) ?? "";
      },
      toData: () => {
        return sigCanvas.current?.toData();
      },
      fromDataURL: (base64String: string, options?: any) => {
        sigCanvas.current?.fromDataURL(base64String, options);
      },
    }));

    const handleClear = () => {
      sigCanvas.current?.clear();
    };

    const handleEnd = () => {
      if (onSave && sigCanvas.current && !sigCanvas.current.isEmpty()) {
        const signature = sigCanvas.current.toDataURL();
        onSave(signature);
      }
    };

    return (
      <div className={cn("relative", className)}>
        <Card className={cn("relative overflow-hidden", canvasClassName)}>
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: cn(
                "w-full border rounded-md cursor-crosshair",
                disabled && "opacity-50 cursor-not-allowed"
              ),
              height,
              width,
              style: {
                touchAction: "none",
              },
            }}
            onEnd={handleEnd}
            disabled={disabled}
          />
          {!disabled && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-muted-foreground/30 text-sm">
              {placeholder}
            </div>
          )}
        </Card>
        {showClearButton && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute top-2 right-2"
            data-testid="button-clear-signature"
          >
            <X className="h-4 w-4" />
            <span className="ml-1">Limpar</span>
          </Button>
        )}
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";
