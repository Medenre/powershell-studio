'use strict';
(() => {
  const frToEn = {
    'Paramètres':'Settings','Ouvrir les paramètres':'Open settings','Sauvegardé localement':'Saved locally','Sauvegarde locale indisponible':'Local storage unavailable','Modifications en cours':'Unsaved changes',
    'Exporter .ps1':'Export .ps1','Nouveau':'New','Ouvrir':'Open','Enregistrer':'Save','Annuler (Ctrl+Z)':'Undo (Ctrl+Z)','Rétablir (Ctrl+Y)':'Redo (Ctrl+Y)',
    'Conception':'Designer','Guide':'Help','PROJET /':'PROJECT /','COMPOSANTS':'COMPONENTS','Glissez un élément sur la fenêtre':'Drag an item onto the window',
    'Rechercher un composant':'Search components','Fermer les composants':'Close components','Fermer les propriétés':'Close properties',
    'Composants':'Components','Propriétés':'Properties','Fenêtre':'Window','Grille 8 px':'8 px grid','Glisser le fond : déplacer la vue':'Drag the background: pan the view',
    'Clic molette : recentrer':'Middle click: recenter','Ctrl / Maj + clic : multisélection':'Ctrl / Shift + click: multiselect',
    'Points latéraux : largeur / hauteur':'Side handles: width / height','Suppr pour retirer':'Delete to remove','Copier le code':'Copy code',
    'Les scripts s’exécutent sous Windows':'Scripts run on Windows','EXPLORATEUR':'LAYERS','Aperçu PowerShell':'PowerShell preview',
    'Les variables sont disponibles dans':'Variables are available in',
    '. Les conditions se créent avec les listes de choix. Le mode avancé accepte les expressions PowerShell ; les valeurs fixes sont échappées automatiquement.':'. Build conditions with the dropdowns. Advanced mode accepts PowerShell expressions; fixed values are escaped automatically.',
    'Paramètres du site':'Site settings','Choisissez une palette pour l’éditeur. Chaque palette possède une version claire et une version sombre ; les couleurs de vos formulaires exportés restent définies par leurs propriétés.':'Choose an editor palette. Every palette has light and dark versions; exported form colors remain defined by their properties.',
    'Langue':'Language','Apparence':'Appearance','Claire':'Light','Sombre':'Dark','Palettes de couleurs':'Color palettes',
    'Couleur d’accent personnalisée':'Custom accent color','Couleur de la palette':'Use palette color','Fermer':'Close','Compris':'Got it',
    'Violet':'Violet','Océan':'Ocean','Émeraude':'Emerald','Coucher de soleil':'Sunset','Rose':'Rose','Ambre':'Amber','Turquoise':'Teal','Ardoise':'Slate',
    'ESSENTIELS':'ESSENTIALS','DONNÉES & STRUCTURE':'DATA & LAYOUT','Glisser ou cliquer pour ajouter':'Drag or click to add',
    'Bouton':'Button','Libellé':'Label','Champ texte':'Text box','Case à cocher':'Check box','Bouton radio':'Radio button','Liste':'List box',
    'Liste déroulante':'Combo box','Nombre':'Number','Date':'Date','Progression':'Progress bar','Groupe visuel':'Visual group','Panneau visuel':'Visual panel',
    'Fenêtre principale':'Main window','IDENTITÉ':'IDENTITY','PROPRIÉTÉS':'PROPERTIES','Nom de variable (préfixe ctrl_)':'Variable name (ctrl_ prefix)','Texte / titre':'Text / title',
    'POSITION & DIMENSIONS':'POSITION & SIZE','Largeur':'Width','Hauteur':'Height','APPARENCE':'APPEARANCE','Fond':'Background','Texte':'Text',
    'Taille de police (pt)':'Font size (pt)','État':'State','Activé':'Enabled','Désactivé':'Disabled','Sélection':'Selection','Non coché':'Unchecked','Coché':'Checked',
    'Éléments (un par ligne)':'Items (one per line)','Valeur (0–100)':'Value (0–100)','ÉVÉNEMENT · CLICK':'CLICK EVENT',
    'Code PowerShell exécuté au clic':'PowerShell code run on click','Élément visuel : les contrôles restent rattachés à la fenêtre.':'Visual item: controls remain attached to the main window.',
    'Dupliquer':'Duplicate','Supprimer':'Delete','Police':'Font','Gras':'Bold','Italique':'Italic','Souligné':'Underline','Non':'No','Oui':'Yes',
    'Opaque':'Opaque','Transparent':'Transparent','Transparent : reprend le fond de la fenêtre, sans révéler les autres composants.':'Transparent: uses the window background without revealing other components.',
    'La fenêtre conserve un fond opaque.':'The window keeps an opaque background.','Ce contrôle Windows Forms conserve un fond opaque.':'This Windows Forms control keeps an opaque background.',
    'Premier plan en haut · Glisser pour réordonner':'Front layer at top · Drag to reorder','Alt + ↑ / ↓ : déplacer le calque':'Alt + ↑ / ↓: move layer',
    'Glisser pour changer le plan':'Drag to change layer','POWERSHELL':'POWERSHELL','Version cible':'Target version','Commande de lancement':'Launch command',
    'Constructeurs modernes ::new().':'Modern ::new() constructors.','Syntaxe New-Object compatible avec les anciennes versions.':'New-Object syntax compatible with older versions.',
    'Le code est actualisé immédiatement. Vos actions personnalisées ne sont pas converties automatiquement.':'Code updates immediately. Custom actions are not converted automatically.',
    'Constructeurs modernes ::new(). Le code est actualisé immédiatement. Vos actions personnalisées ne sont pas converties automatiquement.':'Modern ::new() constructors. Code updates immediately. Custom actions are not converted automatically.',
    'Syntaxe New-Object compatible avec les anciennes versions. Le code est actualisé immédiatement. Vos actions personnalisées ne sont pas converties automatiquement.':'New-Object syntax compatible with older versions. Code updates immediately. Custom actions are not converted automatically.',
    'Centrer ↔':'Center ↔','Centrer ↕':'Center ↕','Aligner à gauche':'Align left','Aligner à droite':'Align right','Aligner en haut':'Align top','Aligner en bas':'Align bottom',
    'Même largeur':'Same width','Même hauteur':'Same height','Espacer ↔':'Distribute ↔','Espacer ↕':'Distribute ↕',
    'Ctrl / Maj + clic : sélection multiple. Centrage dans la fenêtre ; alignement sur les bords du groupe. Même taille : référence = dernier élément sélectionné.':'Ctrl / Shift + click: select multiple items. Center within the window; align to group edges. Equal size uses the last selected item.',
    'Alignement du texte':'Text alignment','Gauche':'Left','Centre':'Center','Droite':'Right','Haut gauche':'Top left','Haut centre':'Top center','Haut droite':'Top right',
    'Milieu gauche':'Middle left','Milieu centre':'Middle center','Milieu droite':'Middle right','Bas gauche':'Bottom left','Bas centre':'Bottom center','Bas droite':'Bottom right',
    'IMAGE INTÉGRÉE':'EMBEDDED IMAGE','Importer PNG, JPEG ou WebP':'Import PNG, JPEG, or WebP','Aperçu de l’image':'Image preview','Retirer':'Remove',
    'L’image sera incluse dans le .ps1, sans fichier annexe.':'The image will be embedded in the .ps1 file.','Taille de l’image (12–128 px)':'Image size (12–128 px)',
    'Position de l’image':'Image position','À gauche du texte':'Left of text','À droite du texte':'Right of text','Au-dessus du texte':'Above text','Sous le texte':'Below text','Superposée au texte':'Over text',
    'Image optimisée à 512 px maximum, proportions conservées.':'Image optimized to 512 px maximum, with aspect ratio preserved.','ERGONOMIE':'USABILITY',
    'Infobulle au survol':'Hover tooltip','Ordre de tabulation (0–999)':'Tab order (0–999)','Lecture seule':'Read only','Masquer le texte (mot de passe)':'Hide text (password)',
    'Composant':'Component','Événement':'Event','Interface':'Interface','Variables':'Variables','Logique':'Logic','Boucles':'Loops','Actions':'Actions','Fichiers':'Files','Avancé':'Advanced',
    'Afficher un message':'Show a message','Demander confirmation':'Ask for confirmation','Changer un texte':'Change text','Ajouter du texte':'Append text','Modifier une propriété':'Change a property',
    'Inverser un état':'Toggle a state','Lire une propriété':'Read a property','Définir une variable':'Set a variable','Incrémenter une variable':'Increase a variable',
    'Condition Si / Sinon':'If / Else condition','Répéter N fois':'Repeat N times','Pour chaque élément':'For each item','Tant que':'While',
    'Essayer / Gérer une erreur':'Try / Catch','Attendre':'Wait','Écrire une sortie':'Write output','Ouvrir un fichier ou URL':'Open a file or URL',
    'Lire un fichier UTF-8':'Read a UTF-8 file','Écrire un fichier UTF-8':'Write a UTF-8 file','Choisir un fichier':'Choose a file',
    'Fermer la fenêtre':'Close the window','Arrêter cet événement':'Stop this event','Code PowerShell libre':'Custom PowerShell code',
    'Message':'Message','Valeur':'Value','Question':'Question','Nouveau texte':'New text','Texte à ajouter':'Text to append','Propriété':'Property','Variable':'Variable',
    'Nom':'Name','Pas':'Step','Condition PowerShell':'PowerShell condition','Nombre de répétitions':'Repeat count','Compteur dans $StudioVars':'Counter in $StudioVars',
    'Collection PowerShell':'PowerShell collection','Élément dans $StudioVars':'Item in $StudioVars','Limite de répétitions':'Repeat limit','Erreur dans $StudioVars':'Error in $StudioVars',
    'Millisecondes':'Milliseconds','Texte ou expression':'Text or expression','Chemin ou URL':'Path or URL','Chemin':'Path','Contenu':'Content','Filtre':'Filter','Code':'Code',
    'Alors':'Then','Sinon':'Else','Si oui':'If yes','Si non':'If no','Faire':'Do','En cas d’erreur':'On error','Ajouter':'Add',
    'Monter':'Move up','Descendre':'Move down','Texte fixe':'Fixed text','Expression PowerShell':'PowerShell expression',
    'Mode de condition':'Condition mode','Listes de choix (sans code)':'Dropdowns (no code)','PowerShell avancé':'Advanced PowerShell',
    'Comparer':'Compare','Propriété d’un composant':'Component property','Avec':'With','Valeur fixe':'Fixed value',
    'Lien':'Join','ET':'AND','OU':'OR','SI':'IF','Comparaison':'Comparison','Type de valeur':'Value type','Vrai / Faux':'True / False',
    'Vrai':'True','Faux':'False','est égal à':'equals','est différent de':'does not equal','est supérieur à':'is greater than','est supérieur ou égal à':'is at least',
    'est inférieur à':'is less than','est inférieur ou égal à':'is at most','contient':'contains','ne contient pas':'does not contain',
    'Retirer cette condition':'Remove this condition','Ajouter une condition (ET / OU)':'Add a condition (AND / OR)',
    'Les variables proposées viennent des autres blocs. Pour en créer une, ajoutez « Définir une variable » avant cette condition.':'Variables come from other blocks. Add “Set a variable” before this condition to create one.',
    'Nombre maximal de tours':'Maximum iterations','Étiquette libre':'Custom tag','Position X':'X position','Position Y':'Y position','Couleur de fond':'Background color',
    'Couleur du texte':'Text color','Choix sélectionné':'Selected item','À l’ouverture':'On load','Fenêtre affichée':'Window shown','Avant fermeture':'Before closing',
    'Au clic':'On click','Au double clic':'On double click','Texte modifié':'Text changed','Case modifiée':'Check box changed','Choix modifié':'Selection changed',
    'Valeur modifiée':'Value changed','Début du survol':'Mouse enters','Fin du survol':'Mouse leaves','Entrée dans le champ':'Field entered',
    'Sortie du champ':'Field left','Touche pressée':'Key pressed','Les blocs s’exécutent dans l’ordre, lors de cet événement.':'Blocks run in order when this event occurs.',
    'Le code manuel du bouton est exécuté après ces blocs.':'Manual button code runs after these blocks.',
    'Aucun bloc pour cet événement. Choisissez une action dans la colonne de gauche.':'No blocks for this event. Choose an action from the left panel.',
    'Script exporté':'Script exported','Projet ouvert':'Project opened','Code copié':'Code copied','Copie indisponible : utilisez Exporter .ps1':'Copy unavailable: use Export .ps1',
    'Sans titre':'Untitled','Nom unique requis : ctrl_ suivi de lettres, chiffres ou _':'Unique name required: ctrl_ followed by letters, digits, or _',
    'Fichier trop volumineux':'File too large','Import impossible :':'Import failed:','Projet non reconnu':'Unrecognized project','Fenêtre invalide':'Invalid window','Composant invalide':'Invalid component',
    'Écartez les éléments avant de les répartir sans chevauchement.':'Move items apart before distributing them without overlap.',
    'Image trop volumineuse : 5 Mo maximum.':'Image too large: 5 MB maximum.','Utilisez une image PNG, JPEG ou WebP.':'Use a PNG, JPEG, or WebP image.',
    'Image trop complexe':'Image too complex','Impossible de lire cette image.':'Could not read this image.',
    'Créer une nouvelle interface ? Pensez à télécharger votre projet actuel.':'Create a new interface? Remember to download your current project.'
  };
  const enToFr=Object.fromEntries(Object.entries(frToEn).map(([fr,en])=>[en,fr]));
  let language='fr';
  try{if(localStorage.getItem('ps-studio-language')==='en')language='en';}catch{}
  function translateUnit(value,map){
    if(Object.hasOwn(map,value))return map[value];
    const count=value.match(/^(\d+) composants?$/);
    if(count)return language==='en'?`${count[1]} component${count[1]==='1'?'':'s'}`:`${count[1]} composant${count[1]==='1'?'':'s'}`;
    const englishCount=value.match(/^(\d+) components?$/);
    if(englishCount&&language==='fr')return `${englishCount[1]} composant${englishCount[1]==='1'?'':'s'}`;
    const selection=value.match(/^MISE EN PAGE · (\d+) SÉLECTIONNÉS?$/);
    if(selection&&language==='en')return `LAYOUT · ${selection[1]} SELECTED`;
    const englishSelection=value.match(/^LAYOUT · (\d+) SELECTED$/);
    if(englishSelection&&language==='fr')return `MISE EN PAGE · ${englishSelection[1]} SÉLECTIONNÉ${englishSelection[1]==='1'?'':'S'}`;
    const version=value.match(/^PowerShell (.+) \(ancien\)$/);
    if(version&&language==='en')return `PowerShell ${version[1]} (legacy)`;
    const englishVersion=value.match(/^PowerShell (.+) \(legacy\)$/);
    if(englishVersion&&language==='fr')return `PowerShell ${englishVersion[1]} (ancien)`;
    const qualified=value.match(/^(.+) \(([^()]*)\)$/);
    if(qualified){const translated=translateUnit(qualified[1],map);if(translated!==qualified[1])return `${translated} (${qualified[2]})`;}
    if(value.includes(' · ')){
      const parts=value.split(' · ');
      const translated=parts.map(part=>translateUnit(part,map));
      if(translated.some((part,index)=>part!==parts[index]))return translated.join(' · ');
    }
    const prefix=value.match(/^([^\p{L}\p{N}$]+)(.+)$/u);
    if(prefix){const rest=translateUnit(prefix[2],map);if(rest!==prefix[2])return prefix[1]+rest;}
    const suffix=value.match(/^(.*) \((à définir|supprimé|incompatible)\)$/);
    if(suffix&&language==='en')return `${suffix[1]} (${({ 'à définir':'not set','supprimé':'deleted','incompatible':'incompatible' })[suffix[2]]})`;
    const englishSuffix=value.match(/^(.*) \((not set|deleted|incompatible)\)$/);
    if(englishSuffix&&language==='fr')return `${englishSuffix[1]} (${({ 'not set':'à définir','deleted':'supprimé','incompatible':'incompatible' })[englishSuffix[2]]})`;
    const palette=value.match(/^(.+) : version claire et sombre$/);
    if(palette&&language==='en')return `${translateUnit(palette[1],map)}: light and dark versions`;
    const englishPalette=value.match(/^(.+): light and dark versions$/);
    if(englishPalette&&language==='fr')return `${translateUnit(englishPalette[1],map)} : version claire et sombre`;
    const importError=value.match(/^Import impossible : (.+)$/);
    if(importError&&language==='en')return `Import failed: ${translateUnit(importError[1],map)}`;
    const imageSuccess=value.match(/^Image intégrée au projet \((\d+) px maximum\)\.$/);
    if(imageSuccess&&language==='en')return `Image added to the project (${imageSuccess[1]} px maximum).`;
    return value;
  }
  function translate(value){
    const match=String(value).match(/^(\s*)([\s\S]*?)(\s*)$/);
    return match[1]+translateUnit(match[2],language==='en'?frToEn:enToFr)+match[3];
  }
  function excluded(node){
    const element=node.nodeType===1?node:node.parentElement;
    return !element||!!element.closest('script,style,textarea,#window,#projectTitle,#code,#visualCode,[data-i18n-skip]');
  }
  function translateElement(element){
    if(excluded(element))return;
    for(const name of ['title','aria-label','placeholder','alt']){
      const value=element.getAttribute(name);
      if(value!==null){const next=translate(value);if(next!==value)element.setAttribute(name,next);}
    }
  }
  function translateTree(root){
    if(excluded(root))return;
    if(root.nodeType===3){const next=translate(root.nodeValue);if(next!==root.nodeValue)root.nodeValue=next;return;}
    if(root.nodeType!==1)return;
    translateElement(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(excluded(node))continue;
      if(node.nodeType===3){const next=translate(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;}
      else translateElement(node);
    }
  }
  function setLanguage(next){
    language=next==='en'?'en':'fr';
    document.documentElement.lang=language;
    document.title=language==='en'?'PowerShell Studio — Interface builder':'PowerShell Studio — Créateur d’interfaces';
    document.getElementById('settingsLanguage').value=language;
    document.getElementById('languageFlag').dataset.language=language;
    try{localStorage.setItem('ps-studio-language',language);}catch{}
    window.VisualEditor?.renderPalette();
    if(!document.getElementById('visualView').hidden)window.VisualEditor?.render();
    translateTree(document.body);
  }
  const observer=new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='characterData')translateTree(record.target);
      else if(record.type==='attributes')translateElement(record.target);
      else for(const node of record.addedNodes)translateTree(node);
    }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder','alt']});
  window.StudioI18n={setLanguage,translate,get language(){return language;}};
  setLanguage(language);
  const helpButton=document.getElementById('help');
  helpButton.addEventListener('click',()=>{
    if(language!=='en')return;
    document.getElementById('dialogBody').innerHTML=`<h2>Build your interface in a few steps.</h2><p>1. Drag or click a component in the palette.<br>2. Move it and resize it with the side and corner handles.<br>3. Select the window to resize the form.<br>4. Edit properties on the right.<br>5. Drag the empty canvas to pan, or middle click to recenter.</p><p>Use <b>Visual scripting</b> to add actions and conditions without writing code. Select a component and event, then add blocks from the left panel. The info buttons explain each block.</p><p>Save downloads a JSON project you can reopen here. Export .ps1 downloads the Windows Forms script for the selected PowerShell version. Editor colors and language do not change your exported form.</p>`;
  });
})();
