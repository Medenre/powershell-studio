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

## Publication sur GitHub Pages

1. Sur GitHub, créer un dépôt nommé `powershell-studio`. Un dépôt public convient à GitHub Pages avec GitHub Free : son code et le site seront accessibles publiquement.
2. Décompresser cette archive sur le PC.
3. Dans le dépôt, choisir **Add file → Upload files** et déposer le contenu du dossier : `index.html`, `app.js`, `style.css`, `README.md` et `.nojekyll`. Ne pas déposer le ZIP ni le dossier parent : `index.html` doit être à la racine du dépôt.
4. Valider avec **Commit changes** sur la branche `main`.
5. Aller dans **Settings → Pages → Build and deployment**.
6. Choisir **Source : Deploy from a branch**, puis la branche **main** et le dossier **/(root)**, puis **Save**.
7. Attendre la fin du déploiement. GitHub affiche l’adresse du site dans la page **Settings → Pages**. Les exécutions sont visibles dans **Actions**.

Il n’y a aucune commande de build à configurer. Les liens CSS et JavaScript sont relatifs et fonctionnent avec un site de projet GitHub Pages. Le fichier `.nojekyll` évite le traitement Jekyll ; il peut être masqué dans l’explorateur de fichiers.

Documentation : https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

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

## Police, fond et ordre des calques

- Dans Apparence, choisir la police, la taille, le gras, l’italique et le souligné. Les styles sont combinables et exportés vers PowerShell 2.0 à 7. La police doit être installée sur le poste Windows pour un rendu identique.
- Fond opaque ou transparent pour Label, CheckBox, RadioButton, GroupBox et Panel. Sous Windows Forms, « transparent » reprend le fond du parent (ici la fenêtre) et ne révèle pas les composants placés derrière. La fenêtre et les autres contrôles restent opaques. Documentation : https://learn.microsoft.com/fr-fr/dotnet/desktop/winforms/controls/how-to-give-your-control-a-transparent-background
- Dans l’explorateur, glisser un élément au-dessus ou au-dessous d’un autre : le haut représente le premier plan. Le trait indique la position de dépôt. Alt + flèche haut/bas permet aussi de réordonner le calque au clavier.
- L’ordre est conservé dans le fichier projet et dans le script exporté. Annuler/rétablir prend en charge les déplacements de calques.
- Les anciens fichiers projet restent compatibles ; les nouvelles propriétés sont initialisées avec des valeurs par défaut.

Vérifications : interface web, glisser-déposer, génération pour les cinq versions cibles et compatibilité des anciens projets. Le script natif n’a pas été exécuté sous Windows dans cet environnement.

## Nouveautés — images et mise en page

- Images sur les boutons : import PNG/JPEG/WebP (5 Mo maximum), retrait, taille de 12 à 128 px, position gauche/droite/haut/bas ou superposition au texte. Images converties en PNG et intégrées en base64 dans le projet et le script : aucun fichier externe à copier. Les proportions sont conservées.
- Nouveau composant Image (PictureBox), optimisé à 512 px maximum. Les icônes de boutons sont optimisées à 128 px maximum.
- Alignement du texte (9 positions sur boutons/libellés/cases et 3 positions horizontales sur les champs).
- Centrer horizontalement ou verticalement un composant, ou un groupe de composants, dans la fenêtre.
- Ctrl/Maj + clic dans le canevas ou l’explorateur pour sélectionner plusieurs composants. Ctrl+A sélectionne tout (hors champs de saisie) ; Échap désélectionne. Déplacement, duplication et suppression s’appliquent à la sélection.
- Alignement gauche/droite/haut/bas sur les bords du groupe ; même largeur ou hauteur que le dernier composant sélectionné (dans les limites de la fenêtre). Espacement régulier à partir de 3 composants, sans chevauchement.
- Infobulles au survol, ordre de tabulation, champs texte en lecture seule et mode mot de passe. Ce dernier masque l’affichage uniquement : ne pas enregistrer un véritable mot de passe dans le projet.
- Explorateur toujours accessible avec défilement indépendant des propriétés.

Ouvrir `index.html` pour utiliser l’application. Facultatif : `node verify.cjs` exécute les vérifications de génération et de géométrie sans dépendance. Les nouveaux réglages sont enregistrés dans le projet JSON. En sélection multiple, les propriétés individuelles concernent le dernier élément sélectionné ; les outils Mise en page concernent toute la sélection.

La génération a été vérifiée pour PowerShell 2.0, 3.0, 4.0, 5.1 et 7.0. L’exécution native Windows doit encore être validée sur le poste cible.
