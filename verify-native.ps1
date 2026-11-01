param([Parameter(Mandatory=$true)][string]$FixtureDir)
$ErrorActionPreference = 'Stop'
$versions = @('2.0','3.0','4.0','5.1','7.0')
foreach ($version in $versions) {
    $file = Join-Path $FixtureDir ('interface-' + $version + '.ps1')
    $tokens = $null
    $errors = $null
    [void][System.Management.Automation.Language.Parser]::ParseFile($file, [ref]$tokens, [ref]$errors)
    if ($errors.Count -gt 0) { throw ('Erreur de syntaxe ' + $version + ': ' + $errors[0].Message) }
    Write-Output ('Syntaxe valide : PowerShell ' + $version)
    if ($version -ne '7.0') {
        & $file
        Write-Output ('Windows Forms exécuté : cible ' + $version + ' sur PowerShell ' + $PSVersionTable.PSVersion.ToString())
    } elseif (Get-Command pwsh.exe -ErrorAction SilentlyContinue) {
        & pwsh.exe -NoProfile -STA -NonInteractive -File $file
        if ($LASTEXITCODE -ne 0) { throw 'Exécution PowerShell 7 échouée' }
        Write-Output 'Windows Forms exécuté : cible 7.0 sur pwsh.exe'
    } else {
        Write-Output 'Moteur PowerShell 7 indisponible : syntaxe vérifiée avec PowerShell 5.1 seulement'
    }
}
$visualFile = Join-Path $FixtureDir 'interface-visual-2.0.ps1'
$tokens = $null
$errors = $null
[void][System.Management.Automation.Language.Parser]::ParseFile($visualFile, [ref]$tokens, [ref]$errors)
if ($errors.Count -gt 0) { throw ('Erreur de syntaxe des blocs visuels : ' + $errors[0].Message) }
& $visualFile
Write-Output 'Boucle et conditions visuelles exécutées au clic sur un bouton'
$containerFile = Join-Path $FixtureDir 'interface-container-2.0.ps1'
$tokens = $null
$errors = $null
[void][System.Management.Automation.Language.Parser]::ParseFile($containerFile, [ref]$tokens, [ref]$errors)
if ($errors.Count -gt 0) { throw ('Erreur de syntaxe du conteneur : ' + $errors[0].Message) }
& $containerFile
Write-Output 'Conteneur Windows Forms et coordonnées relatives vérifiés'
foreach ($legacyVersion in @('2.0','3.0','4.0')) {
    $ErrorActionPreference = 'Continue'
    try { $reported = @(& powershell.exe -Version $legacyVersion -NoProfile -NonInteractive -Command '$PSVersionTable.PSVersion.ToString()' 2>$null) }
    finally { $ErrorActionPreference = 'Stop' }
    $versionText = [string]($reported | Select-Object -Last 1)
    if ($LASTEXITCODE -ne 0 -or -not $versionText.StartsWith($legacyVersion)) {
        Write-Output ('Moteur PowerShell ' + $legacyVersion + ' indisponible sur ce poste : exécution réelle non vérifiée')
        continue
    }
    $legacyFile = Join-Path $FixtureDir ('interface-' + $legacyVersion + '.ps1')
    & powershell.exe -Version $legacyVersion -NoProfile -STA -NonInteractive -File $legacyFile
    if ($LASTEXITCODE -ne 0) { throw ('Exécution réelle échouée : PowerShell ' + $legacyVersion) }
    Write-Output ('Moteur PowerShell ' + $legacyVersion + ' : exécution réelle réussie')
}
