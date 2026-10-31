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
    }
}
