param(
    [Parameter(Mandatory=$true)][string]$ScriptPath,
    [Parameter(Mandatory=$true)][string]$ExpectedVersion
)
$ErrorActionPreference = 'Stop'
if (@('2.0','3.0','4.0','5.1','7.0') -notcontains $ExpectedVersion) { throw 'Version attendue invalide' }
$actual = $PSVersionTable.PSVersion.ToString()
if (-not $actual.StartsWith($ExpectedVersion)) { throw ('Moteur attendu : ' + $ExpectedVersion + ' ; moteur actif : ' + $actual) }
$fullPath = (Resolve-Path -LiteralPath $ScriptPath).Path
$source = [System.IO.File]::ReadAllText($fullPath)
$marker = "try {`r`n    [void]`$MainForm.ShowDialog()"
if (-not $source.Contains($marker)) { throw 'Formulaire généré par PowerShell Studio introuvable dans ce script' }
$timer = @'
$StudioSmokeTimer = New-Object -TypeName System.Windows.Forms.Timer
$StudioSmokeTimer.Interval = 200
$StudioSmokeTimer.Add_Tick({ $StudioSmokeTimer.Stop(); $MainForm.Close() })
$StudioSmokeTimer.Start()
'@
$temporary = Join-Path ([System.IO.Path]::GetTempPath()) ('psstudio-legacy-' + [Guid]::NewGuid().ToString('N') + '.ps1')
try {
    $smoke = $source.Replace($marker, $timer + "`r`n" + $marker)
    [System.IO.File]::WriteAllText($temporary, $smoke, (New-Object System.Text.UTF8Encoding($true)))
    & $temporary
    if (-not $?) { throw 'Le formulaire a échoué sur ce moteur' }
    Write-Output ('PASS : formulaire exécuté sur PowerShell ' + $actual)
} finally {
    if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force }
}
