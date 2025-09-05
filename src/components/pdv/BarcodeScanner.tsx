import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isScanning && videoRef.current) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
      setIsScanning(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <form onSubmit={handleManualSubmit} className="flex-1 flex gap-2">
          <Input
            placeholder="Digite o código de barras ou EAN..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline">
            Buscar
          </Button>
        </form>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsScanning(true)}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isScanning} onOpenChange={setIsScanning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear Código de Barras</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-black rounded"
            />
            <div className="mt-4">
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  placeholder="Ou digite o código manualmente..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">OK</Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}