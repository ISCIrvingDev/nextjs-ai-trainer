"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { vapi } from "@/lib/vapi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function GenerateProgramPage() {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [callEnded, setCallEnded] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Solucion para evitar el error "Meeting has ended"
  useEffect(() => {
    const originalError = console.error;
    // Se hace sobrecarga de "console.error" para ignorar el error "Meeting has ended"
    console.error = function (msg, ...args) {
      if (
        msg &&
        (msg.includes("Meeting has ended") ||
          (args[0] && args[0].toString().includes("Meeting has ended")))
      ) {
        console.log("Ignoring known error: Meeting has ended");
        return; // Evita pasarlo al handler original
      }

      // Pasa todos los otros errores al handler original
      return originalError.call(console, msg, ...args);
    };

    // Restaura el handler original en el unmount del componente
    return () => {
      console.error = originalError;
    };
  }, []);

  // Muestra los mensajes de Vapi y hace un scroll automatico
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Reedirige a "ProfilePage" cuando termina la llamada, despues de 4 segundos
  useEffect(() => {
    if (callEnded) {
      const redirectTimer = setTimeout(() => {
        router.push("/profile");
      }, 4000);

      return () => clearTimeout(redirectTimer);
    }
  }, [callEnded, router]);

  // Vapi: Event listeners
  useEffect(() => {
    // Metodo para manejar el evento para el inicio de la llamada con Vapi
    const handleCallStart = () => {
      console.log("Empieza la llamada");

      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
    };

    // Metodo para manejar el evento para el fin de la llamada con Vapi
    const handleCallEnd = () => {
      console.log("Termina la llamada");

      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };

    // Metodo para manejar el evento para cuando Vapi empieza a hablar
    const handleSpeechStart = () => {
      console.log("AI Voice Agent (Vapi) empieza a hamblar");

      setIsSpeaking(true);
    };

    // Metodo para manejar el evento para cuando Vapi termina de hablar
    const handleSpeechEnd = () => {
      console.log("AI Voice Agent (Vapi) termina de hamblar");

      setIsSpeaking(false);
    };

    // Metodo para manejar el evento para cuando Vapi notifica de un mensaje
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = (message: any) => { // "message" es el mensaje de Vapi
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { content: message.transcript, role: message.role };

        setMessages((prev) => [...prev, newMessage]);
      }
    };

    // Metodo para manejar el evento para cuando Vapi notifica de un error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleError = (error: any) => {
      console.log("Vapi Error", error);

      setConnecting(false);
      setCallActive(false);
    };

    vapi
      .on("call-start", handleCallStart)
      .on("call-end", handleCallEnd)
      .on("speech-start", handleSpeechStart)
      .on("speech-end", handleSpeechEnd)
      .on("message", handleMessage)
      .on("error", handleError);

    // Liberar los recursos de los "event listeners" en el "unmount" de la pagina
    return () => {
      vapi
        .off("call-start", handleCallStart)
        .off("call-end", handleCallEnd)
        .off("speech-start", handleSpeechStart)
        .off("speech-end", handleSpeechEnd)
        .off("message", handleMessage)
        .off("error", handleError);
    };
  }, []);

  // Metodo para que el usuario empiece la llamada con Vapi
  // Boton "Start Call"
  const toggleCall = async () => {
    if (callActive) vapi.stop();
    else {
      try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);

        const fullName = user?.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : "No user";

        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            full_name: fullName, // "full_name" es parte de las variables registradas en el workflow de Vapi
            user_id: user?.id, // Es el ID del usuario logueado con Clerk, "user" es un objeto con los valores del usuario de clerk
          },
        });
      } catch (error) {
        console.error("No se pudo iniciar la llamada: ", error);

        setConnecting(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden  pb-6 pt-24">
      <div className="container mx-auto px-4 h-full max-w-5xl">
        {/* Titulo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-mono">
            <span>Generate Your </span>

            <span className="text-primary uppercase">Fitness Program</span>
          </h1>

          <p className="text-muted-foreground mt-2">
            Have a voice conversation with our AI assistant to create your personalized plan
          </p>
        </div>

        {/* Area de la video llamada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card de la AI Voice Agent */}
          <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* Animacion de la AI Voice Agent */}
              <div
                className={`absolute inset-0 ${isSpeaking ? "opacity-30" : "opacity-0"
                  } transition-opacity duration-300`}
              >
                {/* "Voice wave animation" al momento en que la AI Voice Agent habla */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`mx-1 h-16 w-1 bg-primary rounded-full ${isSpeaking ? "animate-sound-wave" : ""
                        }`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: isSpeaking ? `${Math.random() * 50 + 20}%` : "5%",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Imagen de fondo de la AI Voice Agent */}
              <div className="relative size-32 mb-4">
                <div
                  className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${isSpeaking ? "animate-pulse" : ""
                    }`}
                />

                <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10"></div>

                  <img
                    src="/ai-avatar.png"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground">CodeFlex AI</h2>

              <p className="text-sm text-muted-foreground mt-1">Fitness & Diet Coach</p>

              {/* Indicador de cuando esta hablando la AI Voice Agent */}
              <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${isSpeaking ? "border-primary" : ""}`}>
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-primary animate-pulse" : "bg-muted"}`} />

                <span className="text-xs text-muted-foreground">
                  {
                    isSpeaking
                      ? "Speaking..."
                      : callActive
                        ? "Listening..."
                        : callEnded
                          ? "Redirecting to profile..."
                          : "Waiting..."
                  }
                </span>
              </div>
            </div>
          </Card>

          {/* Card del usuario (logueado con Clerk) */}
          <Card className={`bg-card/90 backdrop-blur-sm border overflow-hidden relative`}>
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* Imagen del usuario */}
              <div className="relative size-32 mb-4">
                <img
                  src={user?.imageUrl}
                  alt="User"
                  // ADD THIS "size-full" class to make it rounded on all images
                  className="size-full object-cover rounded-full"
                />
              </div>

              <h2 className="text-xl font-bold text-foreground">You</h2>

              <p className="text-sm text-muted-foreground mt-1">
                {user ? (user.firstName + " " + (user.lastName || "")).trim() : "Guest"}
              </p>

              {/* Texto "Ready" del lado del usuario */}
              <div className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border`}>
                <div className={`w-2 h-2 rounded-full bg-muted`} />
                <span className="text-xs text-muted-foreground">Ready</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Logs de la llamada con la AI Agent Voice: Contenedor donde se muestran los mensajes */}
        {
          messages.length > 0 && (
            <div
              ref={messageContainerRef}
              className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-64 overflow-y-auto transition-all duration-300 scroll-smooth"
            >
              <div className="space-y-3">
                {
                  messages.map((msg, index) => (
                    <div key={index} className="message-item animate-fadeIn">
                      <div className="font-semibold text-xs text-muted-foreground mb-1">
                        {msg.role === "assistant" ? "CodeFlex AI" : "You"}:
                      </div>

                      <p className="text-foreground">{msg.content}</p>
                    </div>
                  ))
                }

                {
                  callEnded && (
                    <div className="message-item animate-fadeIn">
                      <div className="font-semibold text-xs text-primary mb-1">System:</div>

                      <p className="text-foreground">
                        Your fitness program has been created! Redirecting to your profile...
                      </p>
                    </div>
                  )
                }
              </div>
            </div>
          )
        }

        {/* Boton para que el usuario controle la llamda: Empezar llamada, terminar llamada, etc */}
        <div className="w-full flex justify-center gap-4">
          <Button
            className={`w-40 text-xl rounded-3xl ${callActive
              ? "bg-destructive hover:bg-destructive/90"
              : callEnded
                ? "bg-green-600 hover:bg-green-700"
                : "bg-primary hover:bg-primary/90"
              } text-white relative`}
            onClick={toggleCall}
            disabled={connecting || callEnded}
          >
            {
              connecting && (
                <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
              )
            }

            <span>
              {
                callActive
                  ? "End Call"
                  : connecting
                    ? "Connecting..."
                    : callEnded
                      ? "View Profile"
                      : "Start Call"
              }
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}