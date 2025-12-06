import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import QRCodeStyling from "qr-code-styling";
import "./App.css";

/* ------------------------------------------------------------------
   Styled QR component using qr-code-styling
------------------------------------------------------------------ */

const patternMap = {
  rectangle: "square",
  square: "dots",
  round: "rounded",
  diamond: "classy",
};

const StyledQr = forwardRef(
  ({ value, size, fgColor, bgColor, patternType, errorLevel }, ref) => {
    const containerRef = useRef(null);
    const qrInstanceRef = useRef(null);

    useEffect(() => {
      const dotsType = patternMap[patternType] || "square";

      if (!qrInstanceRef.current) {
        qrInstanceRef.current = new QRCodeStyling({
          data: value || " ",
          width: size,
          height: size,
          qrOptions: {
            errorCorrectionLevel: errorLevel || "M",
          },
          dotsOptions: {
            color: fgColor,
            type: dotsType,
          },
          backgroundOptions: {
            color: bgColor,
          },
          cornersSquareOptions: {
            type: "extra-rounded",
          },
          cornersDotOptions: {
            type: "dot",
          },
        });

        if (containerRef.current) {
          qrInstanceRef.current.append(containerRef.current);
        }
      } else {
        qrInstanceRef.current.update({
          data: value || " ",
          width: size,
          height: size,
          qrOptions: {
            errorCorrectionLevel: errorLevel || "M",
          },
          dotsOptions: {
            color: fgColor,
            type: dotsType,
          },
          backgroundOptions: {
            color: bgColor,
          },
        });
      }
    }, [value, size, fgColor, bgColor, patternType, errorLevel]);

    useImperativeHandle(ref, () => ({
      download(extension = "png", name = "qr-code") {
        if (!qrInstanceRef.current) return;
        qrInstanceRef.current.download({ extension, name });
      },
    }));

    return <div ref={containerRef} />;
  }
);

/* ------------------------------------------------------------------
   Icons
------------------------------------------------------------------ */

const LogInIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" x2="3" y1="12" y2="12" />
  </svg>
);

const GlobeIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20a14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

/* ------------------------------------------------------------------
   Navbar
------------------------------------------------------------------ */

const Navbar = ({ onLoginClick, onRegisterClick }) => {
  return (
    <nav className="navbar-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="brand-pill">GS1</div>
            <span className="text-2xl font-bold text-slate-900">
              qr code generator
            </span>
          </div>

          {/* Links */}
          <div className="hidden sm:flex sm:space-x-8">
            {["Bulk QR", "Blog", "Pricing", "FAQ"].map((item) => (
              <a
                key={item}
                href="#"
                className="nav-link"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center space-x-3">
            <button
              className="nav-ghost-btn"
              onClick={onLoginClick}
            >
              <LogInIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Log In</span>
            </button>
            <button
              className="nav-primary-btn"
              onClick={onRegisterClick}
            >
              Register
            </button>
            <div className="nav-lang-pill">
              <GlobeIcon className="w-4 h-4 mr-1 text-slate-400" />
              Eng
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */

const buildDigitalLinkUrl = (resolver, gtin, extraQuery = {}) => {
  if (!resolver || !gtin) return "";
  const base = resolver.replace(/\/$/, "");
  const params = new URLSearchParams(extraQuery);
  return params.toString()
    ? `${base}/01/${gtin}?${params.toString()}`
    : `${base}/01/${gtin}`;
};

const FormatSelector = ({ value, onChange, disabled }) => {
  const formats = ["PNG", "SVG", "PDF", "EPS"];

  return (
    <div className="format-selector">
      {formats.map((fmt) => (
        <button
          type="button"
          key={fmt}
          disabled={disabled}
          onClick={() => {
            if (!disabled) onChange(fmt);
          }}
          className={`format-pill ${
            value === fmt ? "format-pill-active" : ""
          } ${disabled ? "format-pill-disabled" : ""}`}
        >
          <span className="format-pill-dot" />
          <span>{fmt}</span>
        </button>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------
   Simple GS1 module
------------------------------------------------------------------ */

const SimpleGs1Module = () => {
  const [gtin, setGtin] = useState("12345678901234");
  const [showGtinText, setShowGtinText] = useState(true);
  const [resolver] = useState("https://qr4.be");
  const [url, setUrl] = useState("https://www.mywebsite.com");
  const [error, setError] = useState("");

  const [customTab, setCustomTab] = useState("pattern"); // pattern | eyes | colors
  const [patternType, setPatternType] = useState("square");
  const [fgColor, setFgColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#f9fafb");
  const [errorLevel, setErrorLevel] = useState("M");
  const [size, setSize] = useState(210);

  const [downloadFormat, setDownloadFormat] = useState("PNG");
  const [hasGenerated, setHasGenerated] = useState(false);

  const qrStyledRef = useRef(null);

  const isValidGtin = gtin.length === 14 && /^\d+$/.test(gtin);

  // Simple: Only GTIN encoded (no t=URL)
  const digitalLinkUrl = useMemo(
    () => (isValidGtin ? buildDigitalLinkUrl(resolver, gtin, {}) : ""),
    [resolver, gtin, isValidGtin]
  );

  const canDownload = hasGenerated && !!digitalLinkUrl;

  const handleGenerateClick = () => {
    if (!gtin) {
      setError("Required field");
      setHasGenerated(false);
      return;
    }
    if (!isValidGtin) {
      setError("GTIN must be 14 digits");
      setHasGenerated(false);
      return;
    }
    setError("");
    setHasGenerated(true);
    alert("QR code generated (demo). You can download it below.");
  };

  const handleDownload = () => {
    if (!canDownload) {
      alert("Please generate a QR code first.");
      return;
    }
    if (!qrStyledRef.current) return;

    if (downloadFormat === "PNG") {
      qrStyledRef.current.download("png", "gs1-qr-simple");
    } else if (downloadFormat === "SVG") {
      qrStyledRef.current.download("svg", "gs1-qr-simple");
    } else {
      alert(
        "PDF and EPS downloads are not available in this demo. Please use PNG or SVG."
      );
    }
  };

  const applyPatternPreset = (type) => {
    setPatternType(type);
    if (type === "rectangle") {
      setFgColor("#020617");
      setBgColor("#ffffff");
      setSize(220);
    } else if (type === "square") {
      setFgColor("#111827");
      setBgColor("#f9fafb");
      setSize(210);
    } else if (type === "round") {
      setFgColor("#2563eb");
      setBgColor("#ffffff");
      setSize(210);
    } else if (type === "diamond") {
      setFgColor("#10b981");
      setBgColor("#ffffff");
      setSize(210);
    }
  };

  return (
    <section className="bg-page-gradient py-10">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-[2.1fr,1.3fr] gap-8">
        {/* LEFT: Steps */}
        <div className="card">
          <h1 className="card-title-main">
            GS1 Digital Link QR Code Generator
          </h1>
          <p className="card-subtitle">
            Create GS1-compliant QR codes with GTIN in just a few steps.
          </p>

          {/* STEP 1 */}
          <div className="mt-6 mb-6">
            <p className="step-label">
              STEP 1{" "}
              <span className="font-normal">
                Fill out the following information
              </span>
            </p>

            <label className="block mb-1 text-sm font-medium text-gray-800">
              Enter 14-digit format GTIN code
            </label>
            <input
              type="text"
              maxLength={14}
              value={gtin}
              onChange={(e) => setGtin(e.target.value)}
              className={`text-input ${
                error && !isValidGtin ? "text-input-error" : ""
              }`}
              placeholder="12345678901234"
            />
            {error && !isValidGtin && (
              <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
            {!error && (
              <p className="mt-1 text-xs text-gray-500">Required field</p>
            )}

            <label className="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                checked={showGtinText}
                onChange={(e) => setShowGtinText(e.target.checked)}
                className="checkbox"
              />
              <span className="text-xs text-gray-700">
                Display GTIN under the QR code
              </span>
            </label>

            <div className="mt-4">
              <p className="text-xs font-medium text-gray-700 mb-1">
                GS1 Digital Link resolver
              </p>
              <input
                type="text"
                value={isValidGtin
                  ? digitalLinkUrl
                  : `${resolver.replace(
                      /\/$/,
                      ""
                    )}/01/12345678901234`}
                readOnly
                className="text-input text-input-readonly"
              />
               
            </div>
          </div>

          {/* STEP 2 */}
          <div className="card-section-divider mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">
                Step 2 <span className="font-normal">Enter the URL</span>
              </p>
              <span className="pill-muted">Choose an output method</span>
            </div>

            <p className="text-xs text-blue-600 mb-1">
              Learn how to track data with dynamic QR
            </p>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-input"
              placeholder="https://www.mywebsite.com"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              In this simple configuration the URL is for your reference only.
            </p>

            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <span className="badge badge-success">Dynamic QR</span>
              <span className="badge">Edit URL</span>
              <span className="badge">Track Data</span>
              <span className="badge">Learn more</span>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="card-section-divider">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">
                Step 3{" "}
                <span className="font-normal">Customize your QR code</span>
              </p>
              <button className="help-link">
                Why is my QR code not working?
              </button>
            </div>

            {/* Tabs */}
            <div className="tabs-row mb-3 text-xs">
              {["pattern", "eyes", "colors"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCustomTab(tab)}
                  className={`tab-pill ${
                    customTab === tab ? "tab-pill-active" : ""
                  }`}
                >
                  {tab === "pattern"
                    ? "Pattern"
                    : tab === "eyes"
                    ? "Eyes"
                    : "Colors"}
                </button>
              ))}
            </div>

            {/* Pattern tab */}
            {customTab === "pattern" && (
              <>
                <p className="text-xs text-gray-600 mb-3">
                  Choose a quick style preset. You can still tweak colors later.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-4 text-xs">
                  {[
                    { key: "rectangle", label: "Rectangle pattern QR code" },
                    { key: "square", label: "Square pattern QR code" },
                    { key: "round", label: "Round pattern QR code" },
                    { key: "diamond", label: "Diamond pattern QR code" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPatternPreset(p.key)}
                      className={`pattern-card ${
                        patternType === p.key ? "pattern-card-active" : ""
                      }`}
                    >
                      <div className="pattern-thumbnail" />
                      <span className="text-gray-700">{p.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Eyes tab */}
            {customTab === "eyes" && (
              <div className="info-panel">
                <p className="text-gray-700 mb-1 font-semibold">
                  Eye styles (demo)
                </p>
                <p className="text-gray-600">
                  Eye customization would go here with an advanced QR renderer.
                  This demo keeps them fixed but styled.
                </p>
              </div>
            )}

            {/* Colors tab */}
            {customTab === "colors" && (
              <div className="info-panel">
                <p className="font-semibold text-gray-800 mb-2">
                  QR code appearance
                </p>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <label className="field-label">
                    <span className="text-gray-700">Foreground color</span>
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="color-input"
                    />
                  </label>
                  <label className="field-label">
                    <span className="text-gray-700">Background color</span>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="color-input"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="field-label">
                    <span className="text-gray-700">
                      Size <span className="text-gray-500">(px)</span>
                    </span>
                    <input
                      type="range"
                      min="160"
                      max="260"
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                    />
                    <span className="helper-text">Current: {size}px</span>
                  </label>
                  <label className="field-label">
                    <span className="text-gray-700">Error correction</span>
                    <select
                      value={errorLevel}
                      onChange={(e) => setErrorLevel(e.target.value)}
                      className="select-input"
                    >
                      <option value="L">L (Low)</option>
                      <option value="M">M (Medium)</option>
                      <option value="Q">Q (Quartile)</option>
                      <option value="H">H (High)</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mb-3">
              Always scan to test that your QR code works.
            </p>

            <button
              type="button"
              onClick={handleGenerateClick}
              className="primary-btn w-full"
            >
              Generate QR
            </button>
          </div>
        </div>

        {/* RIGHT: Preview + download */}
        <div className="space-y-4">
          <div className="preview-card">
            <p className="preview-caption">
              Always scan to test that your <br /> QR code works
            </p>

            <div className="preview-qr-wrapper">
              {hasGenerated && digitalLinkUrl ? (
                <StyledQr
                  ref={qrStyledRef}
                  value={digitalLinkUrl}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  patternType={patternType}
                  errorLevel={errorLevel}
                />
              ) : (
                <div className="preview-empty">
                  Fill the fields and click “Generate QR” to preview your GS1 QR
                  code
                </div>
              )}
            </div>

            {showGtinText && isValidGtin && hasGenerated && (
              <p className="gtin-text">{gtin}</p>
            )}

            <FormatSelector
              value={downloadFormat}
              onChange={setDownloadFormat}
              disabled={!canDownload}
            />

            <button
              type="button"
              onClick={handleDownload}
              className={`btn-download ${
                !canDownload ? "btn-download-disabled" : ""
              }`}
              disabled={!canDownload}
            >
              Download
            </button>

            <p className="preview-link">
              {hasGenerated && digitalLinkUrl
                ? digitalLinkUrl
                : "GS1 Digital Link URL will be displayed here after generation"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------
   Extended GS1 module (new enhanced version you just integrated)
------------------------------------------------------------------ */

const ExtendedGs1Module = () => {
  const [gtin, setGtin] = useState("12345678901234");
  const [displayGtin, setDisplayGtin] = useState(true);
  const [resolver] = useState("https://qr4.be");
  const [url, setUrl] = useState("https://www.mywebsite.com");
  const [error, setError] = useState("");

  // ---- Data Attributes (Optional) with + / - rows ----
  const AI_OPTIONS = [
    {
      code: "16",
      label: "Sell-by Date",
      placeholder: "DDMMYYYY",
      maxLength: 8,
    },
    {
      code: "17",
      label: "Use-by Date",
      placeholder: "DDMMYYYY",
      maxLength: 8,
    },
    {
      code: "15",
      label: "Best-before Date",
      placeholder: "DDMMYYYY",
      maxLength: 8,
    },
    {
      code: "10",
      label: "Batch or lot number",
      placeholder: "Up to 20 characters",
      maxLength: 20,
    },
    {
      code: "21",
      label: "Serial number",
      placeholder: "Up to 20 characters",
      maxLength: 20,
    },
  ];

  const getAiMeta = (ai) =>
    AI_OPTIONS.find((opt) => opt.code === ai) || {
      code: ai,
      label: `AI ${ai}`,
      placeholder: "Value",
      maxLength: 90,
    };

  const [dataAttributes, setDataAttributes] = useState([
    { id: 1, ai: "16", value: "" },
  ]);

  const addDataAttributeRow = () => {
    setDataAttributes((prev) => [
      ...prev,
      { id: Date.now(), ai: "16", value: "" },
    ]);
  };

  const removeDataAttributeRow = (id) => {
    setDataAttributes((prev) =>
      prev.length === 1 ? prev : prev.filter((row) => row.id !== id)
    );
  };

  const handleDataAttrAiChange = (id, ai) => {
    setDataAttributes((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ai, value: "" } : row))
    );
  };

  const handleDataAttrValueChange = (id, value) => {
    setDataAttributes((prev) =>
      prev.map((row) => (row.id === id ? { ...row, value } : row))
    );
  };

  // ---- Key Qualifiers (Optional) ----
  const [keyQualifiers, setKeyQualifiers] = useState({
    "22": "",
    "10": "",
    "21": "",
  });

  const handleKeyQualifierChange = (ai, value) => {
    setKeyQualifiers((prev) => ({ ...prev, [ai]: value }));
  };

  // ---- Customization (pattern / colors) ----
  const [customTab, setCustomTab] = useState("pattern");
  const [patternType, setPatternType] = useState("square");
  const [fgColor, setFgColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#f9fafb");
  const [errorLevel, setErrorLevel] = useState("M");
  const [size, setSize] = useState(210);

  const [downloadFormat, setDownloadFormat] = useState("PNG");
  const [hasGenerated, setHasGenerated] = useState(false);

  const qrStyledRef = useRef(null);

  const isValidGtin = gtin.length === 14 && /^\d+$/.test(gtin);

  // ---- Build query from Data Attributes + Key Qualifiers ----
  const query = useMemo(() => {
    const q = {};

    dataAttributes.forEach((row) => {
      const ai = row.ai?.trim();
      const val = row.value?.trim();
      if (ai && val) q[ai] = val;
    });

    Object.entries(keyQualifiers).forEach(([ai, val]) => {
      if (val.trim()) q[ai] = val.trim();
    });

    // URL currently not encoded as t param (per your choice)
    return q;
  }, [dataAttributes, keyQualifiers]);

  const digitalLinkUrl = useMemo(
    () => (isValidGtin ? buildDigitalLinkUrl(resolver, gtin, query) : ""),
    [resolver, gtin, query, isValidGtin]
  );

  const canDownload = hasGenerated && !!digitalLinkUrl;

  const handleGenerateClick = () => {
    if (!gtin) {
      setError("GTIN is required");
      setHasGenerated(false);
      return;
    }
    if (!isValidGtin) {
      setError("GTIN must be 14 digits");
      setHasGenerated(false);
      return;
    }
    setError("");
    setHasGenerated(true);
    alert("Extended GS1 QR generated (demo). PNG/SVG download is available.");
  };

  const handleDownload = () => {
    if (!canDownload) {
      alert("Please generate a QR code first.");
      return;
    }
    if (!qrStyledRef.current) return;

    if (downloadFormat === "PNG") {
      qrStyledRef.current.download("png", "gs1-qr-extended");
    } else if (downloadFormat === "SVG") {
      qrStyledRef.current.download("svg", "gs1-qr-extended");
    } else {
      alert(
        "PDF and EPS downloads are not available in this demo. Please use PNG or SVG."
      );
    }
  };

  const applyPatternPreset = (type) => {
    setPatternType(type);
    if (type === "rectangle") {
      setFgColor("#020617");
      setBgColor("#ffffff");
      setSize(220);
    } else if (type === "square") {
      setFgColor("#111827");
      setBgColor("#f9fafb");
      setSize(210);
    } else if (type === "round") {
      setFgColor("#2563eb");
      setBgColor("#ffffff");
      setSize(210);
    } else if (type === "diamond") {
      setFgColor("#10b981");
      setBgColor("#ffffff");
      setSize(210);
    }
  };

  return (
    <section className="bg-page-gradient py-10 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-[2.1fr,1.3fr] gap-8">
        {/* LEFT */}
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="card-title-main">
              GS1 Digital Link QR Code Generator
            </h2>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              Eng
            </span>
          </div>

          {/* STEP 1 */}
          <div className="mt-2 mb-6">
            <p className="step-label">
              STEP 1{" "}
              <span className="font-normal">
                Fill out the following information
              </span>
            </p>

            <p className="text-xs font-medium text-gray-800 mb-1">
              Primary Identification key{" "}
              <span className="text-blue-600 cursor-pointer">
                GS1 QR code Complete Guide
              </span>
            </p>

            <div className="info-panel info-panel-soft">
              <p className="font-semibold text-gray-800">
                (01) Global Trade Item Number (GTIN)
              </p>
              <p className="text-gray-600">
                Value (14 digits of data) – used as your primary key.
              </p>
            </div>

            <label className="block mb-1 text-sm font-medium text-gray-800">
              Value (14 digits of data)
            </label>
            <input
              type="text"
              maxLength={14}
              value={gtin}
              onChange={(e) => setGtin(e.target.value)}
              className={`text-input ${
                error && !isValidGtin ? "text-input-error" : ""
              }`}
              placeholder="12345678901234"
            />
            {error && !isValidGtin && (
              <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
            {!error && (
              <p className="mt-1 text-xs text-gray-500">Required field</p>
            )}

            {/* Data Attributes (Optional) */}
            <div className="mt-4">
              <p className="section-heading">
                Data Attributes (Optional)
              </p>
              <p className="helper-text mb-2">
                Application Identifier · Value
              </p>

              <div className="space-y-3 text-xs">
                {dataAttributes.map((row) => {
                  const meta = getAiMeta(row.ai);
                  return (
                    <div
                      key={row.id}
                      className="data-row"
                    >
                      <div>
                        <label className="field-label-title">
                          Application Identifier
                        </label>
                        <select
                          value={row.ai}
                          onChange={(e) =>
                            handleDataAttrAiChange(row.id, e.target.value)
                          }
                          className="select-input"
                        >
                          {AI_OPTIONS.map((opt) => (
                            <option key={opt.code} value={opt.code}>
                              ({opt.code}) {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="field-label-title">Value</label>
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) =>
                            handleDataAttrValueChange(row.id, e.target.value)
                          }
                          maxLength={meta.maxLength}
                          placeholder={meta.placeholder}
                          className="text-input text-input-sm"
                        />
                        <p className="helper-text mt-1">{meta.label}</p>
                      </div>
                      <div className="data-row-actions">
                        {dataAttributes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDataAttributeRow(row.id)}
                            className="chip-btn chip-btn-outline"
                            aria-label="Remove data attribute"
                          >
                            −
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addDataAttributeRow}
                className="add-link mt-3"
              >
                + Add data attribute
              </button>

              <p className="helper-text mt-2">
                Custom AI and extended list can be added in a real
                implementation.
              </p>
            </div>

            {/* Key Qualifiers (Optional) */}
            <div className="mt-5">
              <p className="section-heading">Key Qualifiers (Optional)</p>
              <div className="grid sm:grid-cols-2 gap-3 text-xs mt-1">
                <div>
                  <p className="field-label-title">
                    (22) Consumer Product Variant
                  </p>
                  <input
                    type="text"
                    value={keyQualifiers["22"]}
                    onChange={(e) =>
                      handleKeyQualifierChange("22", e.target.value)
                    }
                    placeholder="Up to 20 characters"
                    maxLength={20}
                    className="text-input text-input-sm"
                  />
                </div>
                <div>
                  <p className="field-label-title">
                    (10) Batch or lot number
                  </p>
                  <input
                    type="text"
                    value={keyQualifiers["10"]}
                    onChange={(e) =>
                      handleKeyQualifierChange("10", e.target.value)
                    }
                    placeholder="Up to 20 characters"
                    maxLength={20}
                    className="text-input text-input-sm"
                  />
                </div>
                <div>
                  <p className="field-label-title">(21) Serial number</p>
                  <input
                    type="text"
                    value={keyQualifiers["21"]}
                    onChange={(e) =>
                      handleKeyQualifierChange("21", e.target.value)
                    }
                    placeholder="Up to 20 characters"
                    maxLength={20}
                    className="text-input text-input-sm"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                checked={displayGtin}
                onChange={(e) => setDisplayGtin(e.target.checked)}
                className="checkbox"
              />
              <span className="text-xs text-gray-700">
                Display GTIN under the QR code
              </span>
            </label>

            <div className="mt-4">
              <p className="text-xs font-medium text-gray-700 mb-1">
                GS1 Digital Link (This resolver is used for our dynamic QR
                codes)
              </p>
              <input
                type="text"
                value={isValidGtin
                  ? digitalLinkUrl
                  : `${resolver.replace(
                      /\/$/,
                      ""
                    )}/01/12345678901234?16=525252`}
                readOnly
                className="text-input text-input-readonly"
              />
              
            </div>
          </div>

          {/* STEP 2 */}
          <div className="card-section-divider mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">
                Step 2 <span className="font-normal">Enter the URL</span>
              </p>
              <span className="pill-muted">Choose an output method</span>
            </div>
            <p className="text-xs text-blue-600 mb-1">
              Learn how to track data with dynamic QR
            </p>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-input"
              placeholder="https://www.mywebsite.com"
            />
            <p className="mt-1 text-[11px] text-gray-500">
              In this configuration the URL is for your reference only. If you
              want it encoded as GS1 data later, we can add it as another
              attribute.
            </p>

            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <span className="badge badge-success">Dynamic QR</span>
              <span className="badge">Edit URL</span>
              <span className="badge">Track Data</span>
              <span className="badge">Learn more</span>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="card-section-divider">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">
                Step 3{" "}
                <span className="font-normal">Customize your QR code</span>
              </p>
              <button className="help-link">
                Why is my QR code not working?
              </button>
            </div>

            {/* Tabs */}
            <div className="tabs-row mb-3 text-xs">
              {["pattern", "eyes", "colors"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setCustomTab(tab)}
                  className={`tab-pill ${
                    customTab === tab ? "tab-pill-active" : ""
                  }`}
                >
                  {tab === "pattern"
                    ? "Pattern"
                    : tab === "eyes"
                    ? "Eyes"
                    : "Colors"}
                </button>
              ))}
            </div>

            {/* Pattern tab */}
            {customTab === "pattern" && (
              <>
                <p className="text-xs text-gray-600 mb-3">
                  Choose a quick style preset. You can still tweak colors later.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-4 text-xs">
                  {[
                    { key: "rectangle", label: "Rectangle pattern QR code" },
                    { key: "square", label: "Square pattern QR code" },
                    { key: "round", label: "Round pattern QR code" },
                    { key: "diamond", label: "Diamond pattern QR code" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => applyPatternPreset(p.key)}
                      className={`pattern-card ${
                        patternType === p.key ? "pattern-card-active" : ""
                      }`}
                    >
                      <div className="pattern-thumbnail" />
                      <span className="text-gray-700">{p.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Eyes tab */}
            {customTab === "eyes" && (
              <div className="info-panel">
                <p className="text-gray-700 mb-1 font-semibold">
                  Eye styles (demo)
                </p>
                <p className="text-gray-600">
                  Eye customization would go here with an advanced QR renderer.
                  This demo keeps them fixed but styled.
                </p>
              </div>
            )}

            {/* Colors tab */}
            {customTab === "colors" && (
              <div className="info-panel">
                <p className="font-semibold text-gray-800 mb-2">
                  QR code appearance
                </p>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <label className="field-label">
                    <span className="text-gray-700">Foreground color</span>
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="color-input"
                    />
                  </label>
                  <label className="field-label">
                    <span className="text-gray-700">Background color</span>
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="color-input"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="field-label">
                    <span className="text-gray-700">
                      Size <span className="text-gray-500">(px)</span>
                    </span>
                    <input
                      type="range"
                      min="160"
                      max="260"
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                    />
                    <span className="helper-text">Current: {size}px</span>
                  </label>
                  <label className="field-label">
                    <span className="text-gray-700">Error correction</span>
                    <select
                      value={errorLevel}
                      onChange={(e) => setErrorLevel(e.target.value)}
                      className="select-input"
                    >
                      <option value="L">L (Low)</option>
                      <option value="M">M (Medium)</option>
                      <option value="Q">Q (Quartile)</option>
                      <option value="H">H (High)</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mb-3">
              Always scan to test that your QR code works.
            </p>

            <button
              type="button"
              onClick={handleGenerateClick}
              className="primary-btn w-full"
            >
              Generate QR
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="preview-card">
            <p className="preview-caption">
              Always scan to test that your <br /> QR code works
            </p>
            <div className="preview-qr-wrapper">
              {hasGenerated && digitalLinkUrl ? (
                <StyledQr
                  ref={qrStyledRef}
                  value={digitalLinkUrl}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  patternType={patternType}
                  errorLevel={errorLevel}
                />
              ) : (
                <div className="preview-empty">
                  Fill the fields and click "Generate QR" to preview your GS1 QR
                  code
                </div>
              )}
            </div>
            {displayGtin && isValidGtin && hasGenerated && (
              <p className="gtin-text">{gtin}</p>
            )}

            <FormatSelector
              value={downloadFormat}
              onChange={setDownloadFormat}
              disabled={!canDownload}
            />

            <button
              type="button"
              onClick={handleDownload}
              className={`btn-download ${
                !canDownload ? "btn-download-disabled" : ""
              }`}
              disabled={!canDownload}
            >
              Download
            </button>

            <p className="preview-link">
              {hasGenerated && digitalLinkUrl
                ? digitalLinkUrl
                : "GS1 Digital Link URL will be displayed here after generation"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------
   Login / Register modals
------------------------------------------------------------------ */

const ModalBase = ({ title, children, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

const LoginModal = ({ onClose, onSwitchToRegister }) => {
  return (
    <ModalBase title="Log in to your QR TIGER account" onClose={onClose}>
      <button className="google-btn">Continue with Google</button>
      <div className="divider-row">
        <span />
        <p>or</p>
        <span />
      </div>

      <label className="field-label">
        <span>Email address</span>
        <input type="email" className="text-input" placeholder="you@example.com" />
      </label>

      <label className="field-label">
        <span>Password</span>
        <input type="password" className="text-input" placeholder="••••••••" />
      </label>

      <div className="flex-between mt-2">
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <input type="checkbox" className="checkbox" />
          Remember me
        </label>
        <button className="link-small">Forgot password?</button>
      </div>

      <button className="primary-btn w-full mt-4">Log In</button>

      <p className="modal-footer-text">
        Don&apos;t have an account?{" "}
        <button
          className="link-inline"
          onClick={() => {
            onClose();
            onSwitchToRegister();
          }}
        >
          Sign up
        </button>
      </p>
    </ModalBase>
  );
};

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const industries = [
    "Marketing and Advertising",
    "Retail and eCommerce",
    "Events and Conferences",
    "Real Estate",
    "Logistics and Supply Chain",
    "Education",
    "Food and Beverage",
    "Finance",
    "Hospitality",
    "Travel and Leisure",
    "Government",
    "Entertainment",
    "Manufacturing",
    "Healthcare",
    "Arts and design",
    "Automotive",
  ];
  const [selectedIndustry, setSelectedIndustry] = useState("");

  return (
    <ModalBase title="Create your QR TIGER account" onClose={onClose}>
      <button className="google-btn">Sign up with Google</button>
      <div className="divider-row">
        <span />
        <p>OR</p>
        <span />
      </div>

      <label className="field-label">
        <span>Your Name</span>
        <input type="text" className="text-input" placeholder="John Doe" />
      </label>

      <label className="field-label">
        <span>Email address</span>
        <input type="email" className="text-input" placeholder="you@example.com" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="field-label">
          <span>Country</span>
          <input type="text" className="text-input" defaultValue="India" />
        </label>
        <label className="field-label">
          <span>Phone</span>
          <input type="tel" className="text-input" placeholder="+91 98765 43210" />
        </label>
      </div>

      <label className="field-label">
        <span>Password</span>
        <input type="password" className="text-input" placeholder="Create a password" />
      </label>

      <label className="field-label">
        <span>Confirm password</span>
        <input type="password" className="text-input" placeholder="Repeat password" />
      </label>

      <div className="mt-3">
        <p className="section-heading">
          To give you the best experience, please select your industry:
        </p>
        <div className="industry-grid">
          {industries.map((name) => (
            <button
              key={name}
              type="button"
              className={`industry-chip ${
                selectedIndustry === name ? "industry-chip-active" : ""
              }`}
              onClick={() =>
                setSelectedIndustry((prev) => (prev === name ? "" : name))
              }
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <label className="consent-row">
        <input type="checkbox" className="checkbox" />
        <span>
          I agree to receive alerts, product updates, and special offers via
          email, as described in the Terms and Conditions.
        </span>
      </label>
      <p className="helper-text mt-1">
        Email preferences may be changed any time under My Account.
      </p>

      <button className="primary-btn w-full mt-4">Register</button>

      <p className="modal-footer-text">
        Already have an account?{" "}
        <button
          className="link-inline"
          onClick={() => {
            onClose();
            onSwitchToLogin();
          }}
        >
          Log In
        </button>
      </p>
      <p className="helper-text text-center mt-1">
        By signing up, you agree to the Terms and Conditions and Privacy Policy.
      </p>
    </ModalBase>
  );
};

/* ------------------------------------------------------------------
   Marketing / Why / FAQ / Footer
------------------------------------------------------------------ */

const MarketingSection = () => {
  return (
    <section className="bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h2 className="section-title">
            Create a GS1 digital link QR code in seconds
          </h2>
          <p className="section-body">
            Generate a GS1 digital link QR code with ease. Our advanced GS1 QR
            code generator allows you to customize your QR code to match your
            brand or choose from the wide range of QR code templates available.
          </p>
          <button className="secondary-btn">Book a discovery call</button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 section-grid">
          <div>
            <h3 className="section-subtitle">What is a GS1 QR code?</h3>
            <p className="section-text">
              A GS1 QR code is a type of 2D barcode that conforms to Global
              Standards 1 (GS1). Invented in 1994, QR codes have evolved as the
              most potent product data carrier.
            </p>
            <p className="section-text">
              It can contain comprehensive product information, such as GTIN,
              product variant, batch number, and serial number. Unlike
              traditional 1D barcodes, 2D barcodes like QR codes can meet modern
              demands for efficient product data retrieval, transparency,
              traceability, and accuracy.
            </p>
          </div>
          <div>
            <h3 className="section-subtitle">
              Why use a GS1 digital link QR code?
            </h3>
            <p className="section-text">
              Say hello to a more efficient, accurate, and future-ready product
              tracking system with the best QR code generator. Give your product
              codes a digital upgrade with our advanced GS1 QR codes—an editable
              type of QR code for your products.
            </p>
            <p className="section-text">
              GS1 + QR TIGER QR Code Generator works to satisfy businesses'
              ever-changing demands. QR TIGER makes converting GS1 digital links
              into scannable QR codes fast and easy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const WhySection = () => {
  const cards = [
    {
      title: "They come with advanced built-in features",
      body: "QR TIGER's GS1 QR code is a dynamic QR code solution. It comes with added features, which can ultimately help you maximize your QR and products as well.",
    },
    {
      title: "They're flexible",
      body: "GS1 QR codes are editable. Replacing product codes is no longer a hassle. Easily modify existing product barcodes without creating and reprinting a new one.",
    },
    {
      title: "Sustainable & cost-saving",
      body: "Replacing product barcodes over and over wastes time, materials, and money. GS1 QR codes help you keep one code while updating the data behind it.",
    },
    {
      title: "Show off your brand",
      body: "Seamlessly blend your branding into your GS1 QR codes. Select custom colors, add your business logo, and more.",
    },
    {
      title: "Interactive packaging is on the rise",
      body: "Businesses are shifting to QR codes. The usage rate keeps growing year-on-year, making GS1 QR codes a smart upgrade for modern packaging.",
    },
  ];

  return (
    <section className="bg-slate-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="section-title">Why use GS1 QR codes?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div key={c.title} className="benefit-card">
              <h3>{c.title}</h3>
              <p>{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FaqSection = () => {
  const questions = [
    "What is GS1?",
    "What is a GS1 digital link?",
    "What is a GS1 QR code?",
    "How do I create a GS1 QR code for my product?",
    "How does a GS1 QR code work?",
    "Why do you need a GS1 QR code?",
    "What's the difference between the 1D barcode and 2D barcode?",
    "What information can I store in a GS1 QR code?",
    "Can I edit the stored data in a GS1 QR code?",
    "Can I add a logo to my QR code?",
    "How do I add a logo to my QR code?",
    "Can I customize the appearance of my GS1 QR code?",
    "Can I edit my GS1 QR code design?",
    "Is the GS1 QR code trackable?",
    "How do I track my GS1 QR code?",
  ];
  return (
    <section className="bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="space-y-2 text-sm">
          {questions.map((q) => (
            <details key={q} className="faq-item">
              <summary>{q}</summary>
              <p>
                This is placeholder explanatory text. You can replace it with
                detailed content for: "{q}".
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const resources = [
    "GS1 2D Barcode",
    "Barcode Tracking System",
    "GS1 Product Identification",
    "GS1 QR code for Tracking",
    "GS1 QR code Supply Chain",
    "GS1 QR code for Farm to Table",
    "GS1 QR code for Parts and Components",
    "GS1 QR code for Product Authentication and Warranties",
    "Revolutionalize Inventory Management GS1 Barcodes for Retail",
  ];
  const community = ["Guides", "Help Center", "Blog"];
  const terms = [
    "Terms and Conditions",
    "Terms of Acceptable Use",
    "Privacy Policy",
    "Cookies Policy",
  ];
  const company = ["About us", "Contact Us"];

  return (
    <footer className="footer-root">
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-gray-600">
        {/* Newsletter */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="footer-title">Stay in the loop</h3>
            <p className="footer-subtitle">
              Sign up for our newsletter and be the first to hear about promos,
              updates, and tips.
            </p>
            <div className="newsletter-row">
              <input
                type="email"
                placeholder="Your email address"
                className="text-input text-input-sm"
              />
              <button className="secondary-btn">Subscribe</button>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="footer-heading">Resources</h4>
            <ul className="footer-list">
              {resources.map((item) => (
                <li key={item}>
                  <a href="#" className="footer-link">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Join the community</h4>
            <ul className="footer-list">
              {community.map((item) => (
                <li key={item}>
                  <a href="#" className="footer-link">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Terms</h4>
            <ul className="footer-list">
              {terms.map((item) => (
                <li key={item}>
                  <a href="#" className="footer-link">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-list">
              {company.map((item) => (
                <li key={item}>
                  <a href="#" className="footer-link">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal */}
        <div className="footer-legal">
          <p className="font-semibold text-gray-700">qr code generator</p>
          <p>
            This QR Code Generator is a registered trademark of QR TIGER PTE.
            LTD.
          </p>
          <p>
            GS1 and digital link and its logos are registered trademarks of GS1
            global.
          </p>
          <p>
            'QR Code' is a trademark of DENSO WAVE INCORPORATED. ©
            2024 www.qrcode-tiger.com
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ------------------------------------------------------------------
   Root
------------------------------------------------------------------ */

const App = () => {
  const [mode, setMode] = useState("simple"); // "simple" | "extended"
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const openLogin = () => {
    setShowLogin(true);
    setShowRegister(false);
  };

  const openRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };

  const closeLogin = () => setShowLogin(false);
  const closeRegister = () => setShowRegister(false);

  return (
    <div className="app-root">
      <Navbar onLoginClick={openLogin} onRegisterClick={openRegister} />

      {/* Toggle Simple / Extended */}
      <div className="toggle-bar">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3 text-sm">
          <button
            onClick={() => setMode("simple")}
            className={`toggle-chip ${
              mode === "simple" ? "toggle-chip-active" : ""
            }`}
          >
            Simple GS1 QR (GTIN + URL)
          </button>
          <button
            onClick={() => setMode("extended")}
            className={`toggle-chip ${
              mode === "extended" ? "toggle-chip-active" : ""
            }`}
          >
            Extended GS1 Digital Link
          </button>
        </div>
      </div>

      {mode === "simple" ? <SimpleGs1Module /> : <ExtendedGs1Module />}

      <MarketingSection />
      <WhySection />
      <FaqSection />
      <Footer />

      {showLogin && (
        <LoginModal
          onClose={closeLogin}
          onSwitchToRegister={openRegister}
        />
      )}

      {showRegister && (
        <RegisterModal
          onClose={closeRegister}
          onSwitchToLogin={openLogin}
        />
      )}
    </div>
  );
};

export default App;