import React, { useEffect } from "react";
import config from "./config.json";
import Quagga from "quagga";
import "./Scanner.css"; // Importar arquivo de estilos

const Scanner = ({ onDetected }) => {
  useEffect(() => {
    console.log("Initializing Quagga with config:", config);

    Quagga.init(config, (err) => {
      if (err) {
        console.error("Error initializing Quagga:", err);
        return;
      }
      console.log("Quagga initialized successfully");
      Quagga.start();
    });

    return () => {
      console.log("Stopping Quagga");
      Quagga.stop();
    };
  }, []);

  useEffect(() => {
    Quagga.onProcessed((result) => {
      const drawingCanvas = Quagga.canvas.dom.overlay;
      const drawingCtx = drawingCanvas.getContext("2d", { willReadFrequently: true });

      if (result) {
        console.log("Processing result:", result);
        
        if (result.boxes) {
          drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
          result.boxes.filter((box) => box !== result.box)
            .forEach((box) => {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                color: "green",
                lineWidth: 2,
              });
            });
        }

        if (result.box) {
          Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
            color: "#00F",
            lineWidth: 2,
          });
        }

        if (result.codeResult && result.codeResult.code) {
          console.log("Code detected:", result.codeResult.code);
          Quagga.ImageDebug.drawPath(result.line, { x: "x", y: "y" }, drawingCtx, {
            color: "red",
            lineWidth: 3,
          });
        } else {
          console.log("No code detected in result:", result);
        }
      }
    });

    Quagga.onDetected((result) => {
      console.log("Detected result:", result);
      if (result && result.codeResult) {
        console.log("Detected code:", result.codeResult.code);
        onDetected(result.codeResult.code);
      } else {
        console.log("No codeResult in detected result:", result);
      }
    });

    return () => {
      console.log("Removing Quagga event listeners");
      Quagga.offProcessed();
      Quagga.offDetected();
    };
  }, [onDetected]);

  return (
    <div id="interactive" className="viewport w-full p-0 h-fit" />
  );
};

export default Scanner;
