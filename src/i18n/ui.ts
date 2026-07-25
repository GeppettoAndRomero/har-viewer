/**
 * Interactive-island strings, per locale. Separate from page-level content
 * (`en.ts` / `ja.ts` …): this is the text the Preact islands render.
 *
 * IMPORTANT: islands receive `locale` as a PROP (present during SSR) and never
 * read it from `document`. SSR and client render the same string, so there is no
 * hydration mismatch.
 *
 * Interpolated strings carry `{name}` / `{count}` / `{kind}` templates; the island does
 * `.replace('{token}', x)`.
 */
export const ui = {
  en: {
    // HarViewer — open / dropzone
    uploadHeading: 'Open a HAR file',
    uploadSubtitle: 'Choose a .har capture exported from your browser’s DevTools. It is read on your device.',
    dropClick: 'Click to choose a file',
    dropOr: 'or drop it anywhere on the page',
    dropSupported: 'Supported: .har (HAR 1.2)',

    // HarViewer — toolbar / meta
    entryCountLabel: 'Requests',
    durationLabel: 'Capture duration',
    flaggedCountLabel: 'Flagged',
    loadAnother: 'Open another file',
    tableLabel: 'HAR requests',
    close: 'Close',

    // HarViewer — table columns
    colFlag: 'Flags',
    colMethod: 'Method',
    colUrl: 'URL',
    colStatus: 'Status',
    colType: 'Type',
    colSize: 'Size',
    colTime: 'Time',
    colWaterfall: 'Timeline',
    colAction: 'Details',
    viewDetailsAction: 'View details for',

    // HarViewer — error states
    errWrongType: '{name} is not a supported file. Choose a .har file exported from DevTools.',
    errUnreadable: 'The file {name} could not be read. Please try again.',
    errEmpty: 'The file {name} is empty — there is nothing to show.',
    errInvalidJson: '{name} is not valid JSON, so it cannot be a HAR file.',
    errNotHar: '{name} does not look like a valid HAR file (no log.entries array found).',

    // HarViewer — secret/token detection
    secretFlagAria: 'Possible secret detected',
    secretsSummary:
      '{count} request(s) contain values that look like tokens, keys, or session cookies. Nothing is hidden or redacted — review them before you share this file with anyone.',
    secretMatchAria: 'possible secret: {kind}',
    secretBearerToken: 'Bearer token',
    secretJwt: 'JWT',
    secretAwsKey: 'AWS access key',
    secretGithubToken: 'GitHub token',
    secretApiKeyPrefix: 'API key (sk- prefix)',
    secretQueryParam: 'Sensitive query parameter name',
    secretCookieHeader: 'Cookie header present',

    // HarViewer — detail panel
    detailHeading: 'Request details',
    closeDetail: 'Close details',
    statusLabel: 'Status',
    httpVersionLabel: 'HTTP version',
    timingHeading: 'Timing',
    timingBlocked: 'Blocked',
    timingDns: 'DNS',
    timingConnect: 'Connect',
    timingSend: 'Send',
    timingWait: 'Wait',
    timingReceive: 'Receive',
    queryParamsHeading: 'Query parameters',
    requestHeadersHeading: 'Request headers',
    responseHeadersHeading: 'Response headers',
    requestBodyHeading: 'Request body',
    responseBodyHeading: 'Response body',
    cookiesHeading: 'Cookies',
    requestCookiesHeading: 'Sent with the request',
    responseCookiesHeading: 'Set by the response',
    noBody: 'No body.',
    bodyBinaryNote: 'Binary content is not shown.',

    // GlobalDropZone
    dzProcessing: 'Opening {count} file(s)…',
    dzPleaseWait: 'Please wait',
    dzDropTitle: 'Drop a file to view',
    dzDropSub: '.har files can be viewed',

    // InstallPrompt
    installHeading: 'Install app',
    installBody: 'Add to your home screen for quick access.',
    install: 'Install',
    later: 'Later',

    // ThemeToggle
    themeToLight: 'Switch to light mode',
    themeToDark: 'Switch to dark mode',
    themeLabel: 'Theme',

    // shared
    required: 'Required',
  },
  ja: {
    // HarViewer — open / dropzone
    uploadHeading: 'HAR ファイルを開く',
    uploadSubtitle: 'ブラウザの DevTools からエクスポートした .har ファイルを選んでください。ファイルは端末内で読み込まれます。',
    dropClick: 'クリックしてファイルを選択',
    dropOr: 'またはページ上にドロップ',
    dropSupported: '対応形式: .har (HAR 1.2)',

    // HarViewer — toolbar / meta
    entryCountLabel: 'リクエスト数',
    durationLabel: 'キャプチャ時間',
    flaggedCountLabel: '検出件数',
    loadAnother: '別のファイルを開く',
    tableLabel: 'HAR リクエスト一覧',
    close: '閉じる',

    // HarViewer — table columns
    colFlag: 'フラグ',
    colMethod: 'メソッド',
    colUrl: 'URL',
    colStatus: 'ステータス',
    colType: '種類',
    colSize: 'サイズ',
    colTime: '時間',
    colWaterfall: 'タイムライン',
    colAction: '詳細',
    viewDetailsAction: '詳細を表示:',

    // HarViewer — error states
    errWrongType: '{name} は対応していない形式です。DevTools からエクスポートした .har ファイルを選んでください。',
    errUnreadable: 'ファイル {name} を読み込めませんでした。もう一度お試しください。',
    errEmpty: 'ファイル {name} は空です。表示する内容がありません。',
    errInvalidJson: '{name} は正しい JSON ではないため、HAR ファイルとして読み込めません。',
    errNotHar: '{name} は有効な HAR ファイルではないようです（log.entries 配列が見つかりません）。',

    // HarViewer — secret/token detection
    secretFlagAria: '機密情報の可能性を検出',
    secretsSummary:
      '{count} 件のリクエストに、トークン・キー・セッション Cookie らしき値が含まれています。値は隠したり書き換えたりしていません。このファイルを共有する前に必ず確認してください。',
    secretMatchAria: '検出された可能性: {kind}',
    secretBearerToken: 'Bearer トークン',
    secretJwt: 'JWT',
    secretAwsKey: 'AWS アクセスキー',
    secretGithubToken: 'GitHub トークン',
    secretApiKeyPrefix: 'API キー（sk- プレフィックス）',
    secretQueryParam: '機密性の高いクエリパラメータ名',
    secretCookieHeader: 'Cookie ヘッダが存在',

    // HarViewer — detail panel
    detailHeading: 'リクエスト詳細',
    closeDetail: '詳細を閉じる',
    statusLabel: 'ステータス',
    httpVersionLabel: 'HTTP バージョン',
    timingHeading: 'タイミング',
    timingBlocked: 'Blocked',
    timingDns: 'DNS',
    timingConnect: 'Connect',
    timingSend: 'Send',
    timingWait: 'Wait',
    timingReceive: 'Receive',
    queryParamsHeading: 'クエリパラメータ',
    requestHeadersHeading: 'リクエストヘッダ',
    responseHeadersHeading: 'レスポンスヘッダ',
    requestBodyHeading: 'リクエストボディ',
    responseBodyHeading: 'レスポンスボディ',
    cookiesHeading: 'Cookie',
    requestCookiesHeading: 'リクエストで送信',
    responseCookiesHeading: 'レスポンスで設定',
    noBody: 'ボディはありません。',
    bodyBinaryNote: 'バイナリデータは表示していません。',

    // GlobalDropZone
    dzProcessing: '{count} 件のファイルを開いています…',
    dzPleaseWait: 'お待ちください',
    dzDropTitle: 'ドロップで表示',
    dzDropSub: '.har ファイルを表示できます',

    // InstallPrompt
    installHeading: 'アプリを追加',
    installBody: 'ホーム画面に追加すると、すぐに開けます。',
    install: '追加',
    later: 'あとで',

    // ThemeToggle
    themeToLight: 'ライトモードに切り替え',
    themeToDark: 'ダークモードに切り替え',
    themeLabel: 'テーマ',

    // shared
    required: '必須',
  },
  zh: {
    // HarViewer — open / dropzone
    uploadHeading: '打开 HAR 文件',
    uploadSubtitle: '选择从浏览器 DevTools 导出的 .har 文件。文件在你的设备上读取。',
    dropClick: '点击选择文件',
    dropOr: '或把文件拖到页面任意位置',
    dropSupported: '支持格式：.har (HAR 1.2)',

    // HarViewer — toolbar / meta
    entryCountLabel: '请求数',
    durationLabel: '抓包时长',
    flaggedCountLabel: '检测到',
    loadAnother: '打开其他文件',
    tableLabel: 'HAR 请求列表',
    close: '关闭',

    // HarViewer — table columns
    colFlag: '标记',
    colMethod: '方法',
    colUrl: 'URL',
    colStatus: '状态',
    colType: '类型',
    colSize: '大小',
    colTime: '耗时',
    colWaterfall: '时间线',
    colAction: '详情',
    viewDetailsAction: '查看详情：',

    // HarViewer — error states
    errWrongType: '{name} 不是受支持的文件。请选择从 DevTools 导出的 .har 文件。',
    errUnreadable: '无法读取文件 {name}。请重试。',
    errEmpty: '文件 {name} 为空，没有可显示的内容。',
    errInvalidJson: '{name} 不是有效的 JSON，因此不能作为 HAR 文件读取。',
    errNotHar: '{name} 看起来不是有效的 HAR 文件（未找到 log.entries 数组）。',

    // HarViewer — secret/token detection
    secretFlagAria: '检测到可能的敏感信息',
    secretsSummary:
      '{count} 个请求中包含疑似令牌、密钥或会话 Cookie 的值。这些值未被隐藏或涂改——请在分享此文件前自行检查。',
    secretMatchAria: '可能的敏感信息：{kind}',
    secretBearerToken: 'Bearer 令牌',
    secretJwt: 'JWT',
    secretAwsKey: 'AWS 访问密钥',
    secretGithubToken: 'GitHub 令牌',
    secretApiKeyPrefix: 'API 密钥（sk- 前缀）',
    secretQueryParam: '敏感查询参数名',
    secretCookieHeader: '存在 Cookie 头',

    // HarViewer — detail panel
    detailHeading: '请求详情',
    closeDetail: '关闭详情',
    statusLabel: '状态',
    httpVersionLabel: 'HTTP 版本',
    timingHeading: '时间分解',
    timingBlocked: 'Blocked',
    timingDns: 'DNS',
    timingConnect: 'Connect',
    timingSend: 'Send',
    timingWait: 'Wait',
    timingReceive: 'Receive',
    queryParamsHeading: '查询参数',
    requestHeadersHeading: '请求头',
    responseHeadersHeading: '响应头',
    requestBodyHeading: '请求体',
    responseBodyHeading: '响应体',
    cookiesHeading: 'Cookie',
    requestCookiesHeading: '请求中发送的',
    responseCookiesHeading: '响应中设置的',
    noBody: '没有正文内容。',
    bodyBinaryNote: '不显示二进制内容。',

    // GlobalDropZone
    dzProcessing: '正在打开 {count} 个文件…',
    dzPleaseWait: '请稍候',
    dzDropTitle: '拖放即可查看',
    dzDropSub: '可以查看 .har 文件',

    // InstallPrompt
    installHeading: '安装应用',
    installBody: '添加到主屏幕，方便随时打开。',
    install: '安装',
    later: '以后再说',

    // ThemeToggle
    themeToLight: '切换到浅色模式',
    themeToDark: '切换到深色模式',
    themeLabel: '主题',

    // shared
    required: '必填',
  },
  de: {
    // HarViewer — open / dropzone
    uploadHeading: 'HAR-Datei öffnen',
    uploadSubtitle: 'Wähle eine .har-Datei, die du aus den Browser-DevTools exportiert hast. Sie wird auf deinem Gerät gelesen.',
    dropClick: 'Zum Auswählen klicken',
    dropOr: 'oder Datei irgendwo auf die Seite ziehen',
    dropSupported: 'Unterstützt: .har (HAR 1.2)',

    // HarViewer — toolbar / meta
    entryCountLabel: 'Anfragen',
    durationLabel: 'Aufzeichnungsdauer',
    flaggedCountLabel: 'Markiert',
    loadAnother: 'Andere Datei öffnen',
    tableLabel: 'HAR-Anfragen',
    close: 'Schließen',

    // HarViewer — table columns
    colFlag: 'Hinweise',
    colMethod: 'Methode',
    colUrl: 'URL',
    colStatus: 'Status',
    colType: 'Typ',
    colSize: 'Größe',
    colTime: 'Zeit',
    colWaterfall: 'Zeitverlauf',
    colAction: 'Details',
    viewDetailsAction: 'Details anzeigen für',

    // HarViewer — error states
    errWrongType: '{name} wird nicht unterstützt. Wähle eine .har-Datei aus den DevTools.',
    errUnreadable: 'Die Datei {name} konnte nicht gelesen werden. Bitte versuche es erneut.',
    errEmpty: 'Die Datei {name} ist leer – es gibt nichts anzuzeigen.',
    errInvalidJson: '{name} ist kein gültiges JSON und kann daher keine HAR-Datei sein.',
    errNotHar: '{name} sieht nicht wie eine gültige HAR-Datei aus (kein log.entries-Array gefunden).',

    // HarViewer — secret/token detection
    secretFlagAria: 'Mögliches Geheimnis erkannt',
    secretsSummary:
      '{count} Anfrage(n) enthalten Werte, die wie Tokens, Schlüssel oder Sitzungs-Cookies aussehen. Nichts wird verborgen oder geschwärzt – prüfe sie, bevor du diese Datei mit jemandem teilst.',
    secretMatchAria: 'mögliches Geheimnis: {kind}',
    secretBearerToken: 'Bearer-Token',
    secretJwt: 'JWT',
    secretAwsKey: 'AWS-Zugriffsschlüssel',
    secretGithubToken: 'GitHub-Token',
    secretApiKeyPrefix: 'API-Schlüssel (sk--Präfix)',
    secretQueryParam: 'Sensibler Query-Parametername',
    secretCookieHeader: 'Cookie-Header vorhanden',

    // HarViewer — detail panel
    detailHeading: 'Anfragedetails',
    closeDetail: 'Details schließen',
    statusLabel: 'Status',
    httpVersionLabel: 'HTTP-Version',
    timingHeading: 'Zeitaufschlüsselung',
    timingBlocked: 'Blocked',
    timingDns: 'DNS',
    timingConnect: 'Connect',
    timingSend: 'Send',
    timingWait: 'Wait',
    timingReceive: 'Receive',
    queryParamsHeading: 'Query-Parameter',
    requestHeadersHeading: 'Anfrage-Header',
    responseHeadersHeading: 'Antwort-Header',
    requestBodyHeading: 'Anfragetext',
    responseBodyHeading: 'Antworttext',
    cookiesHeading: 'Cookies',
    requestCookiesHeading: 'Mit der Anfrage gesendet',
    responseCookiesHeading: 'Von der Antwort gesetzt',
    noBody: 'Kein Inhalt.',
    bodyBinaryNote: 'Binärinhalte werden nicht angezeigt.',

    // GlobalDropZone
    dzProcessing: '{count} Datei(en) werden geöffnet …',
    dzPleaseWait: 'Bitte warten',
    dzDropTitle: 'Datei zum Ansehen ablegen',
    dzDropSub: '.har-Dateien können angezeigt werden',

    // InstallPrompt
    installHeading: 'App installieren',
    installBody: 'Zum Startbildschirm hinzufügen, um es direkt zu öffnen.',
    install: 'Installieren',
    later: 'Später',

    // ThemeToggle
    themeToLight: 'Zum hellen Modus wechseln',
    themeToDark: 'Zum dunklen Modus wechseln',
    themeLabel: 'Design',

    // shared
    required: 'Erforderlich',
  },
  es: {
    // HarViewer — open / dropzone
    uploadHeading: 'Abrir un archivo HAR',
    uploadSubtitle: 'Elige un archivo .har exportado desde las DevTools de tu navegador. Se lee en tu dispositivo.',
    dropClick: 'Haz clic para elegir un archivo',
    dropOr: 'o suéltalo en cualquier parte de la página',
    dropSupported: 'Compatible: .har (HAR 1.2)',

    // HarViewer — toolbar / meta
    entryCountLabel: 'Solicitudes',
    durationLabel: 'Duración de la captura',
    flaggedCountLabel: 'Marcadas',
    loadAnother: 'Abrir otro archivo',
    tableLabel: 'Solicitudes HAR',
    close: 'Cerrar',

    // HarViewer — table columns
    colFlag: 'Avisos',
    colMethod: 'Método',
    colUrl: 'URL',
    colStatus: 'Estado',
    colType: 'Tipo',
    colSize: 'Tamaño',
    colTime: 'Tiempo',
    colWaterfall: 'Cronología',
    colAction: 'Detalles',
    viewDetailsAction: 'Ver detalles de',

    // HarViewer — error states
    errWrongType: '{name} no es un archivo compatible. Elige un archivo .har exportado desde las DevTools.',
    errUnreadable: 'No se pudo leer el archivo {name}. Inténtalo de nuevo.',
    errEmpty: 'El archivo {name} está vacío: no hay nada que mostrar.',
    errInvalidJson: '{name} no es JSON válido, así que no puede ser un archivo HAR.',
    errNotHar: '{name} no parece ser un archivo HAR válido (no se encontró el array log.entries).',

    // HarViewer — secret/token detection
    secretFlagAria: 'Posible secreto detectado',
    secretsSummary:
      '{count} solicitud(es) contienen valores que parecen tokens, claves o cookies de sesión. Nada se oculta ni se censura: revísalos antes de compartir este archivo con alguien.',
    secretMatchAria: 'posible secreto: {kind}',
    secretBearerToken: 'Token Bearer',
    secretJwt: 'JWT',
    secretAwsKey: 'Clave de acceso de AWS',
    secretGithubToken: 'Token de GitHub',
    secretApiKeyPrefix: 'Clave de API (prefijo sk-)',
    secretQueryParam: 'Nombre de parámetro sensible',
    secretCookieHeader: 'Encabezado de cookie presente',

    // HarViewer — detail panel
    detailHeading: 'Detalles de la solicitud',
    closeDetail: 'Cerrar detalles',
    statusLabel: 'Estado',
    httpVersionLabel: 'Versión de HTTP',
    timingHeading: 'Tiempos',
    timingBlocked: 'Blocked',
    timingDns: 'DNS',
    timingConnect: 'Connect',
    timingSend: 'Send',
    timingWait: 'Wait',
    timingReceive: 'Receive',
    queryParamsHeading: 'Parámetros de consulta',
    requestHeadersHeading: 'Encabezados de la solicitud',
    responseHeadersHeading: 'Encabezados de la respuesta',
    requestBodyHeading: 'Cuerpo de la solicitud',
    responseBodyHeading: 'Cuerpo de la respuesta',
    cookiesHeading: 'Cookies',
    requestCookiesHeading: 'Enviadas con la solicitud',
    responseCookiesHeading: 'Definidas por la respuesta',
    noBody: 'Sin contenido.',
    bodyBinaryNote: 'El contenido binario no se muestra.',

    // GlobalDropZone
    dzProcessing: 'Abriendo {count} archivo(s)…',
    dzPleaseWait: 'Espera un momento',
    dzDropTitle: 'Suelta un archivo para verlo',
    dzDropSub: 'Se pueden ver archivos .har',

    // InstallPrompt
    installHeading: 'Instalar la app',
    installBody: 'Añádela a tu pantalla de inicio para tenerla siempre a mano.',
    install: 'Instalar',
    later: 'Más tarde',

    // ThemeToggle
    themeToLight: 'Cambiar al modo claro',
    themeToDark: 'Cambiar al modo oscuro',
    themeLabel: 'Tema',

    // shared
    required: 'Obligatorio',
  },
} as const;

export type UiStrings = (typeof ui)['en'];
