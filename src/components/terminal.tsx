import { createSignal, onMount, onCleanup } from "solid-js";
import { Github, Linkedin } from "lucide-solid";
import CollinPfeiferImage from "/collin.pfeifer4.jpeg";

export default function Terminal() {
  const [typedCommand, setTypedCommand] = createSignal<string>("");
  const [showOutput, setShowOutput] = createSignal<boolean>(false);
  const [showTerminal, setShowTerminal] = createSignal<boolean>(true);

  onMount(() => {
    // Fade in after a short delay
    setTimeout(() => setShowTerminal(true), 200);

    // Typing animation
    const fullCommand = "$ whoami";
    let index = 0;
    const typingInterval = setInterval(() => {
      setTypedCommand((prev) => prev + fullCommand[index]);
      index++;
      if (index >= fullCommand.length) {
        clearInterval(typingInterval);
        setTimeout(() => setShowOutput(true), 500); // reveal output after typing
      }
    }, 100);

    onCleanup(() => clearInterval(typingInterval));
  });

  return (
    showTerminal() && (
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              w-[600px] max-w-[90vw] bg-gray-900 rounded-lg overflow-hidden
              border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10
              animate-fade-in"
      >
        {/* Terminal Header */}
        <div class="bg-gray-800 px-4 py-2 flex items-center">
          <div class="flex space-x-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div class="text-white text-center flex-1 font-mono mr-13.5">
            fish
          </div>
        </div>

        {/* Terminal Content */}
        <div class="p-6">
          <div class="flex flex-col md:flex-row gap-6">
            {showOutput() && (
              <div class="flex-shrink-0">
                <div class="h-29  rounded-lg flex items-center justify-center">
                  <img
                    class="h-29 rounded-md"
                    src={CollinPfeiferImage}
                    alt="Photo of Collin Pfeifer"
                  />
                </div>
              </div>
            )}

            <div class="flex-1">
              <div class="text-green-400 font-mono mb-2">
                {typedCommand()}
                <span class="animate-pulse">▍</span>
              </div>

              {showOutput() && (
                <div class="text-white font-mono space-y-2 transition-opacity duration-500 opacity-100">
                  <p>Collin Pfeifer</p>
                  <p>Typescript, Python, Go</p>
                  <p>Infra @ OmniSOC</p>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          {showOutput() && (
            <div class="flex space-x-4 mt-6">
              <a
                href="https://github.com/aspectrr"
                target="_blank"
                rel="noopener noreferrer"
                class="p-2 bg-purple-800 rounded-md hover:bg-purple-600 transition-colors flex items-center gap-2 text-white"
              >
                <Github size={20} />
                <span class="font-mono text-sm">GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/collin-pfeifer/"
                target="_blank"
                rel="noopener noreferrer"
                class="p-2 bg-purple-800 rounded-md hover:bg-purple-600 transition-colors flex items-center gap-2 text-white"
              >
                <Linkedin size={20} />
                <span class="font-mono text-sm">LinkedIn</span>
              </a>
            </div>
          )}
        </div>
      </div>
    )
  );
}
