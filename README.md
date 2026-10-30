# PowerShell Studio

Éditeur visuel d’interfaces Windows Forms avec export PowerShell. Application statique en français, sans dépendance, sans compilation et sans serveur applicatif.

## Fonctionnalités

- 12 composants à glisser-déposer, propriétés, couleurs, police et actions de boutons.
- Redimensionnement par les quatre côtés et le coin inférieur droit.
- Zoom et dézoom avec recentrage automatique.
- Thème clair/sombre mémorisé.
- Choix de PowerShell 2.0, 3.0, 4.0, 5.1 ou 7 dans les propriétés de la fenêtre.
- Régénération du code et téléchargement direct d’un `.ps1` UTF-8 avec BOM.
- Enregistrement et ouverture des projets JSON, sauvegarde locale, annuler/rétablir.

## Utilisation locale

Décompresser l’archive et ouvrir `index.html` avec un navigateur moderne. Tous les fichiers doivent rester dans le même dossier. Pour un stockage local et une copie dans le presse-papiers plus prévisibles, servir le dossier sur localhost, par exemple avec Python :

```sh
python -m http.server 8000
```

Puis ouvrir http://localhost:8000. Python est facultatif et ne sert qu’à cet aperçu local.


## Reprendre les projets de l’ancien site

La sauvegarde automatique appartient au navigateur et à l’adresse du site. Elle ne se transfère pas automatiquement vers GitHub Pages. Sur l’ancien site, cliquer sur **Enregistrer**, puis importer le fichier `.psstudio.json` avec **Ouvrir** sur le nouveau site. Les projets personnels ne sont pas inclus dans cette archive.

## Exécuter un script exporté

Sous Windows, depuis le dossier contenant le script :

```powershell
powershell.exe -STA -File .\interface.ps1
```

Pour la cible PowerShell 7 :

```powershell
pwsh.exe -STA -File .\interface.ps1
```

La cible sélectionnée est une version minimale (`#requires`). Les cibles 2.0 à 4.0 génèrent des constructeurs `New-Object`, les cibles 5.1 et 7 des constructeurs `::new()`. Le choix de version n’installe pas PowerShell et ne change pas la politique d’exécution Windows. Les scripts personnalisés des boutons ne sont pas convertis automatiquement.

Si le fichier téléchargé est bloqué par la politique RemoteSigned, et après vérification de son contenu, le débloquer avec `Unblock-File -LiteralPath .\interface.ps1` sur une version de PowerShell qui fournit cette commande, puis le relancer. La commande Unblock-File n’existe pas en PowerShell 2.0. Les politiques imposées par l’organisation restent applicables.

## Limites et données

- L’aperçu dans le navigateur peut différer légèrement des contrôles natifs Windows.
- Les panneaux et groupes sont visuels : les contrôles restent rattachés à la fenêtre principale.
- L’éditeur ne lance pas de code PowerShell dans le navigateur.
- La sauvegarde automatique utilise localStorage. Exporter régulièrement les projets avec **Enregistrer**.
- Les scripts doivent être testés sur les versions Windows/PowerShell ciblées ; l’environnement de développement n’a pas exécuté Windows Forms.

## Fichiers

- `index.html` : structure de l’application.
- `style.css` : styles, thèmes et poignées.
- `app.js` : édition, sauvegarde, zoom et génération PowerShell.
- `.nojekyll` : publication statique GitHub Pages.
- `README.md` : ce guide.


