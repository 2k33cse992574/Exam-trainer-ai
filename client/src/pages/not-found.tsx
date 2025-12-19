import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card border-destructive/20 shadow-2xl">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <h1 className="text-2xl font-bold font-mono">404 Error</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground font-mono">
            The requested academic resource could not be located. 
            Coordinate parameters invalid.
          </p>

          <div className="mt-8 flex justify-end">
            <Link href="/">
              <Button variant="default" className="font-mono">
                Return to Base
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
