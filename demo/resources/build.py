import subprocess
import shlex
import os
import sys

def compile(args):

    # Construct the command
    command = [
        "/usr/bin/python",
        "-E",
        f"/emscripten/em++.py"
    ] + args
    
    # Execute the command
    try:
        result = subprocess.run(
            command,
            cwd="/working",
            env={"PATH": "/emscripten"},  # Setting environment variable for path
            text=True,                    # Ensure input/output are treated as text
            capture_output=True           # Capture stdout and stderr
        )
        
        # Print standard output and error
        if result.stdout:
            print("stdout:", result.stdout.strip())
        if result.stderr:
            print("stderr:", result.stderr.strip())
        
        return result.returncode
    
    except Exception as e:
        print("An error occurred:", e)
        return None

# Define the C++ flags and the Emscripten flags
cpp_flags = [
    "-O1", "-fexceptions", "-std=c++20", "-I/raylib/include", 
    "-L/raylib/lib", "-lraylib", "-lrlImGui", "-lbox2d", "-DPLATFORM_WEB"
]

emscripten_flags = [
    "-sEXIT_RUNTIME=1", "-sUSE_GLFW=3", "-sASYNCIFY", 
    "-sSINGLE_FILE=1", "-sMINIFY_HTML=0", "-sFETCH", 
    "-sUSE_CLOSURE_COMPILER=0"
]

# Define the common C/C++ file extensions (excluding headers)
cpp_extensions = [".cpp", ".c", ".cc", ".cxx", ".c++"]

# Find all the relevant source files in the /working directory
source_files = [
    f for f in os.listdir("/working")
    if os.path.isfile(os.path.join("/working", f)) and any(f.endswith(ext) for ext in cpp_extensions)
]

# Call the function with the flags
retcode = compile(cpp_flags + emscripten_flags + source_files + ["-o", "/working/main.html"])
sys.exit(retcode)