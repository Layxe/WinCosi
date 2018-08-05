# WinCosi

## Beschreibung

Bei WinCosi handelt es sich um einen Text-Editor sowie Interpreter für Cosi-Assembler Code. Dieser basiert auf dem Prinzip eines "von-Neumann-Rechners".
Der Editor unterstützt die automatische Inkrementierung von Speicheradressen, falls bspw. eine neue Zeile eingefügt wird. Sowie eine grafisch vereinfachte Darstellung der vorgehensweise des Rechners. Programmiert wurde der Emulator in JavaScript mit Hilfe von HTML, sowie CSS. Ausgeführt wird dieses Programm in einer Electron-Shell und ist somit mit nahezu allen Betriebssystemen kompatibel.

## Cosi

### Speicherverwaltung

Eine grundlegende Manipulierung des Speichers wird mit folgenden Befehlen
ausgeführt:
  - LDA<U/D/I/R> <Adresse> <- Lade den Inhalt einer Speicheradresse in den AKKU
  - STOD<D/I/R> <Adresse> <- Speichere den Inhalt des AKKU in einer Speicheradresse

Weiterhin unterstützt der Emulator Stack Befehle:
  - PUS <- Lege den Inhalt des AKKU auf dem obersten Platz des Stacks ab
  - POP <- Hole das oberste Element vom Stack und speichere es im AKKU
  - ADS <- Addiere die beiden obersten Stack-Elemente miteinadern
  - SUS <- Subtrahiere die beiden obersten Stack-Elemente miteinander
  - MUS <- Multipliziere die beiden obersten Stack-Elemente miteinander
  - DIS <- Dividiere die beiden obersten Stack-Elemente miteinander

### Navigation

Der Emulator unterstützt ebenso das springen zu verschiedenen Adressen, etwa 
vergleichbar mit dem GOTO Befehl:
  - BRT(D/I/R) <Adresse> <- Springe zur gewünschten Adresse
  - BRP(D/I/R) <Adresse> <- Falls der Inhalt des AKKU positiv ist, springe zur Adresse
  - BRE(D/I/R) <Adresse> <- Falls der Inhalt des AKKU 0 ist, springe zur Adresse

### Mathematische Operationen

Ebenso können mit dem Emulator simple mathematische Aktionen durchgeführt werden:
  - ADD(U/D/I/R) <Adresse/Wert> <- Addiere den Wert auf den AKKU
  - SUB(U/D/I/R) <Adresse/Wert> <- Subtrahiere den AKKU mit dem Wert
  - MUL(U/D/I/R) <Adresse/Wert> <- Multipliziere den Wert mit dem AKKU
  - DIV(U/D/I/R) <Adresse/Wert> <- Dividiere den AKKU mit dem Wert

### Adressierung

Wie Sie vielleicht schon mitbekommen haben gibt es verschiedene Adressierungsmethoden, dazu zählen:
  - U ("unmittelbar") <- Verwende den angegebenen Wert z.B. ADDU 5 := AKKU + 5; LDAU 5 := AKKU = 5
  - D ("direkt) <- Verwende den Inhalt der angegebenen Speicheradresse z.B. ADDD 5 := AKKU + <Inhalt der 5. Speicherzelle>
  - I ("indirekt") <- Verwende den Inhalt der in der Speicheradresse angegebenen   Speicheradresse z.B. ADDI 5 := AKKU + <Inhalt der Adresse, die in der 5. Speicherzelle steht>
  - R ("relativ") <- Verwende die n-te vorherige Adresse z.B. ADDR 5 := AKKU + <Inhalt der Speicheradresse, welche 5 Zellen vorher liegt>

## Installation

Benötigt wird [NodeJS](https://nodejs.org/en/) sowie NPM. Ebenso natürlich Git ;)

> $ git clone https://github.com/Layxe/WinCosi
> $ cd WinCosi
> $ npm install
> $ npm start

Natürlich lässt sich das Ganze auch mit einem beliebigen Electron Packager in eine
.exe Datei des gewünschten Betriebssystems kompilieren
