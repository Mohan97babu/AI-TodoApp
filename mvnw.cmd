@echo off
setlocal
if not defined JAVA_HOME (
    if exist "C:\Program Files\Android\openjdk\jdk-21.0.8" (
        set "JAVA_HOME=C:\Program Files\Android\openjdk\jdk-21.0.8"
    )
)
"%~dp0tools\apache-maven-3.9.6\bin\mvn.cmd" %*
