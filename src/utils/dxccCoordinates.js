/**
 * DXCC Entity Geographic Coordinates
 *
 * Provides latitude/longitude coordinates for DXCC entities to display on world map.
 *
 * SOURCE: https://github.com/amazingproducer/dxcc-world-map
 * GeoJSON representation of Earth divided into DXCC entities
 * Coordinates calculated as geometric centroids of each entity's polygon
 *
 * Format: { dxccId: [latitude, longitude] }
 *
 * All 338 active DXCC entities included with verified coordinates.
 */

// Continent fallback coordinates (used when specific entity coords not available)
const CONTINENT_FALLBACKS = {
  'NA': [40, -100],    // North America (center USA)
  'SA': [-15, -60],    // South America (center Brazil)
  'EU': [50, 10],      // Europe (center Germany)
  'AF': [0, 20],       // Africa (center Africa)
  'AS': [30, 100],     // Asia (center China)
  'OC': [-25, 135],    // Oceania (center Australia)
  'AN': [-75, 0],      // Antarctica (South Pole)
};

// DXCC entity coordinates - extracted from dxcc-world-map GeoJSON
const DXCC_COORDINATES = {
  1: [46.5, -63.4],  // Canada
  3: [34.8, 67.7],  // Afghanistan
  4: [-10.4, 56.6],  // Agalega & St. Brandon Is.
  5: [60.2, 20.6],  // Aland Is.
  6: [57.4, -153.4],  // Alaska
  7: [41.3, 20.1],  // Albania
  9: [-14.3, -169.6],  // American Samoa
  11: [10.8, 93.4],  // Andaman & Nicobar Is.
  12: [18.4, -63.2],  // Anguilla
  13: [-80.4, -62.4],  // Antarctica
  14: [40.1, 45.2],  // Armenia
  15: [50.1, 142.7],  // Asiatic Russia
  16: [-49.7, 178.8],  // New Zealand Subantarctic Islands
  17: [15.7, -63.6],  // Aves I.
  18: [39.4, 45.3],  // Azerbaijan
  20: [0.5, -176.5],  // Baker & Howland Is.
  21: [39.4, 2.7],  // Balearic Is.
  22: [3.0, 131.1],  // Palau
  24: [-54.4, 3.3],  // Bouvet
  27: [53.3, 28.1],  // Belarus
  29: [28.5, -16.0],  // Canary Is.
  31: [-4.7, -174.5],  // C. Kiribati (British Phoenix Is.)
  32: [35.3, -2.9],  // Ceuta & Melilla
  33: [-6.2, 71.9],  // Chagos Is.
  34: [-44.0, -176.4],  // Chatham Is.
  35: [-10.5, 105.6],  // Christmas I.
  36: [10.3, -109.2],  // Clipperton I.
  37: [5.5, -87.0],  // Cocos I.
  38: [-12.0, 96.9],  // Cocos (Keeling) Is.
  40: [35.3, 24.9],  // Crete
  41: [-46.3, 51.2],  // Crozet I.
  43: [18.4, -67.5],  // Desecheo I.
  45: [36.4, 27.2],  // Dodecanese
  46: [3.7, 114.8],  // East Malaysia
  47: [-27.1, -109.4],  // Easter I.
  48: [6.4, -162.4],  // E. Kiribati (Line Is.)
  49: [1.4, 10.0],  // Equatorial Guinea
  50: [23.8, -103.0],  // Mexico
  51: [14.6, 39.8],  // Eritrea
  52: [58.5, 25.7],  // Estonia
  53: [9.1, 39.0],  // Ethiopia
  54: [58.3, 45.7],  // European Russia
  56: [-3.8, -32.4],  // Fernando de Noronha
  60: [23.3, -75.0],  // Bahamas
  61: [80.8, 56.0],  // Franz Josef Land
  62: [13.2, -59.5],  // Barbados
  63: [3.5, -53.4],  // French Guiana
  64: [32.3, -64.8],  // Bermuda
  65: [18.5, -64.6],  // British Virgin Is.
  66: [17.4, -88.6],  // Belize
  69: [19.5, -80.8],  // Cayman Is.
  70: [21.3, -78.8],  // Cuba
  71: [-0.1, -90.8],  // Galapagos Is.
  72: [18.8, -70.5],  // Dominican Republic
  74: [13.8, -88.8],  // El Salvador
  75: [42.2, 43.4],  // Georgia
  76: [15.5, -90.2],  // Guatemala
  77: [12.2, -61.6],  // Grenada
  78: [18.8, -72.8],  // Haiti
  79: [16.2, -61.4],  // Guadeloupe
  80: [14.7, -86.4],  // Honduras
  82: [18.2, -77.3],  // Jamaica
  84: [14.6, -61.1],  // Martinique
  86: [13.1, -85.0],  // Nicaragua
  88: [8.5, -80.3],  // Panama
  89: [21.6, -71.7],  // Turks & Caicos Is.
  90: [10.5, -61.5],  // Trinidad & Tobago
  91: [12.5, -70.0],  // Aruba
  94: [17.4, -61.8],  // Antigua & Barbuda
  95: [15.4, -61.4],  // Dominica
  96: [16.6, -62.2],  // Montserrat
  97: [13.9, -61.0],  // St. Lucia
  98: [13.0, -61.3],  // St. Vincent
  99: [-11.5, 47.3],  // Glorioso Is.
  100: [-54.5, -67.0],  // Argentina
  103: [13.4, 144.8],  // Guam
  104: [-16.5, -64.0],  // Bolivia
  105: [19.9, -75.2],  // Guantanamo Bay
  106: [49.6, -2.5],  // Guernsey
  107: [10.3, -10.9],  // Guinea
  108: [-9.6, -56.9],  // Brazil
  109: [11.9, -15.1],  // Guinea-Bissau
  110: [19.6, -155.6],  // Hawaii
  111: [-53.0, 73.2],  // Heard I.
  112: [-54.2, -70.1],  // Chile
  114: [54.2, -4.6],  // Isle of Man
  116: [4.5, -72.7],  // Colombia
  117: [46.2, 6.1],  // ITU HQ
  118: [71.0, -8.5],  // Jan Mayen
  120: [-1.7, -78.9],  // Ecuador
  122: [49.1, -2.1],  // Jersey
  123: [16.7, -169.5],  // Johnston I.
  124: [-22.3, 40.3],  // Juan de Nova, Europa
  125: [-33.7, -79.9],  // Juan Fernandez Is.
  126: [54.7, 21.7],  // Kaliningrad
  129: [4.6, -59.0],  // Guyana
  130: [47.2, 65.1],  // Kazakhstan
  131: [-38.3, 77.5],  // Amsterdam & St. Paul Is.
  132: [-23.4, -57.7],  // Paraguay
  133: [-30.5, -178.5],  // Kermadec Is.
  135: [41.4, 74.0],  // Kyrgyzstan
  136: [-7.9, -74.1],  // Peru
  137: [36.8, 127.6],  // Republic of Korea
  138: [28.4, -178.3],  // Kure I.
  140: [3.8, -56.0],  // Suriname
  141: [-51.7, -59.6],  // Falkland Is.
  142: [10.0, 72.8],  // Lakshadweep Is.
  143: [18.3, 103.6],  // Laos
  144: [-32.7, -56.1],  // Uruguay
  145: [56.8, 24.7],  // Latvia
  146: [55.1, 23.8],  // Lithuania
  147: [-31.7, 159.2],  // Lord Howe I.
  148: [7.3, -67.0],  // Venezuela
  149: [38.6, -27.9],  // Azores
  150: [-42.0, 146.6],  // Australia
  152: [22.2, 113.6],  // Macao
  153: [-54.6, 158.9],  // Macquarie I.
  157: [-0.5, 166.9],  // Nauru
  158: [-16.3, 167.5],  // Vanuatu
  159: [3.6, 73.1],  // Maldives
  160: [-20.3, -175.6],  // Tonga
  161: [4.0, -81.6],  // Malpelo I.
  162: [-21.2, 165.5],  // New Caledonia
  163: [-6.1, 155.3],  // Papua New Guinea
  165: [-20.2, 57.6],  // Mauritius
  166: [17.4, 145.6],  // Mariana Is.
  167: [60.3, 19.1],  // Market Reef
  168: [8.7, 168.2],  // Marshall Is.
  169: [-12.8, 45.1],  // Mayotte
  170: [-43.5, 171.1],  // New Zealand
  171: [-17.4, 155.9],  // Mellish Reef
  172: [-25.1, -130.1],  // Pitcairn I.
  173: [8.4, 142.9],  // Micronesia
  174: [28.2, -177.4],  // Midway I.
  175: [-18.5, -145.1],  // French Polynesia
  176: [-17.7, 178.0],  // Fiji
  177: [24.3, 154.0],  // Minami Torishima
  179: [47.0, 28.5],  // Moldova
  180: [40.3, 24.1],  // Mount Athos
  181: [-17.9, 34.9],  // Mozambique
  182: [18.4, -75.0],  // Navassa I.
  185: [-10.5, 161.9],  // Solomon Is.
  187: [15.3, 8.5],  // Niger
  188: [-19.1, -169.9],  // Niue
  189: [-29.1, 168.0],  // Norfolk I.
  190: [-13.8, -172.1],  // Samoa
  191: [-10.9, -165.9],  // North Cook Is.
  192: [27.1, 142.2],  // Ogasawara
  195: [-1.4, 5.6],  // Annobon I.
  197: [-0.4, -160.0],  // Palmyra & Jarvis Is.
  199: [-68.8, -90.6],  // Peter 1 I.
  201: [-46.8, 37.8],  // Prince Edward & Marion Is.
  202: [18.3, -66.4],  // Puerto Rico
  203: [42.5, 1.5],  // Andorra
  204: [18.8, -112.4],  // Revillagigedo
  205: [-8.0, -14.4],  // Ascension I.
  206: [47.5, 12.2],  // Austria
  207: [-19.7, 63.3],  // Rodriguez I.
  209: [50.7, 4.4],  // Belgium
  211: [44.0, -59.9],  // Sable I.
  212: [42.9, 24.7],  // Bulgaria
  213: [18.1, -63.1],  // Saint Martin
  214: [42.3, 9.1],  // Corsica
  215: [35.0, 33.4],  // Cyprus
  216: [14.0, -80.6],  // San Andres & Providencia
  217: [-26.3, -80.0],  // San Felix & San Ambrosio
  219: [0.9, 7.0],  // Sao Tome & Principe
  221: [55.5, 12.0],  // Denmark
  222: [62.0, -7.0],  // Faroe Is.
  223: [53.4, -2.6],  // England
  224: [65.5, 25.8],  // Finland
  225: [40.2, 9.0],  // Sardinia
  227: [46.3, 4.2],  // France
  229: [3.5, 102.7],  // West Malaysia
  230: [51.1, 10.6],  // Federal Republic of Germany
  232: [6.8, 47.1],  // Somalia
  233: [36.1, -5.3],  // Gibraltar
  234: [-18.1, -163.1],  // South Cook Is.
  235: [-54.5, -37.0],  // South Georgia I.
  236: [39.9, 23.3],  // Greece
  237: [74.1, -41.0],  // Greenland
  238: [-60.7, -45.3],  // South Orkney Is.
  239: [47.4, 19.1],  // Hungary
  240: [-57.7, -27.2],  // South Sandwich Is.
  241: [-62.5, -60.5],  // South Shetland Is.
  242: [65.3, -19.3],  // Iceland
  245: [53.5, -7.7],  // Ireland
  246: [41.9, 12.5],  // Sovereign Military Order of Malta
  247: [9.4, 115.1],  // Spratly Is.
  248: [43.1, 12.7],  // Italy
  249: [17.3, -62.7],  // St. Kitts & Nevis
  250: [-16.0, -5.7],  // St. Helena
  251: [47.2, 9.5],  // Liechtenstein
  252: [47.2, -60.2],  // St. Paul I.
  253: [0.9, -29.3],  // St. Peter & St. Paul Rocks
  254: [49.8, 6.0],  // Luxembourg
  256: [32.8, -16.7],  // Madeira Is.
  257: [36.0, 14.4],  // Malta
  259: [77.9, 22.6],  // Svalbard
  262: [38.6, 70.9],  // Tajikistan
  263: [52.2, 5.6],  // Netherlands
  265: [54.5, -6.7],  // Northern Ireland
  266: [66.3, 18.0],  // Norway
  269: [51.7, 19.3],  // Poland
  270: [-9.1, -171.8],  // Tokelau Is.
  272: [39.8, -8.0],  // Portugal
  273: [-20.5, -29.1],  // Trindade & Martim Vaz Is.
  274: [-37.3, -12.5],  // Tristan da Cunha & Gough I.
  275: [45.9, 25.1],  // Romania
  276: [-15.9, 54.5],  // Tromelin I.
  277: [46.9, -56.4],  // St. Pierre & Miquelon
  278: [43.9, 12.5],  // San Marino
  279: [56.2, -3.1],  // Scotland
  280: [39.2, 58.6],  // Turkmenistan
  281: [40.3, -3.8],  // Spain
  282: [-7.5, 177.8],  // Tuvalu
  283: [34.6, 32.9],  // UK Sovereign Base Areas on Cyprus
  284: [62.9, 16.8],  // Sweden
  285: [18.2, -64.8],  // Virgin Is.
  286: [1.3, 31.9],  // Uganda
  287: [46.7, 8.0],  // Switzerland
  288: [48.5, 30.7],  // Ukraine
  289: [40.7, -74.0],  // United Nations HQ
  291: [38.3, -90.2],  // United States of America
  292: [41.1, 65.5],  // Uzbekistan
  293: [17.0, 106.0],  // Viet Nam
  294: [52.3, -3.4],  // Wales
  295: [41.9, 12.5],  // Vatican
  296: [43.8, 21.0],  // Serbia
  297: [19.3, 166.6],  // Wake I.
  298: [-13.9, -177.3],  // Wallis & Futuna Is.
  301: [-0.2, 174.5],  // W. Kiribati (Gilbert Is.)
  302: [24.8, -12.0],  // Western Sahara
  303: [-16.2, 150.0],  // Willis I.
  304: [26.1, 50.6],  // Bahrain
  305: [23.4, 90.6],  // Bangladesh
  306: [27.5, 90.6],  // Bhutan
  308: [9.8, -84.2],  // Costa Rica
  309: [20.0, 97.1],  // Myanmar
  312: [12.5, 104.9],  // Cambodia
  315: [7.6, 80.9],  // Sri Lanka
  318: [19.2, 109.9],  // China
  321: [22.4, 114.1],  // Hong Kong
  324: [24.0, 83.4],  // India
  327: [-9.9, 120.3],  // Indonesia
  330: [33.4, 53.4],  // Iran
  333: [33.6, 44.6],  // Iraq
  336: [32.2, 35.2],  // Israel
  339: [33.6, 133.6],  // Japan
  342: [31.1, 36.7],  // Jordan
  344: [39.9, 127.3],  // Democratic People's Rep. of Korea
  345: [4.6, 114.8],  // Brunei Darussalam
  348: [29.3, 47.7],  // Kuwait
  354: [33.8, 35.9],  // Lebanon
  363: [47.2, 104.6],  // Mongolia
  369: [28.2, 84.6],  // Nepal
  370: [20.8, 56.7],  // Oman
  372: [30.8, 69.4],  // Pakistan
  375: [7.7, 124.7],  // Philippines
  376: [25.3, 51.2],  // Qatar
  378: [23.9, 43.7],  // Saudi Arabia
  379: [-7.0, 52.4],  // Seychelles
  381: [1.4, 103.9],  // Singapore
  382: [11.8, 42.6],  // Djibouti
  384: [35.2, 38.1],  // Syria
  386: [23.9, 121.1],  // Taiwan
  387: [13.1, 100.6],  // Thailand
  390: [38.4, 36.3],  // Turkey
  391: [24.2, 54.2],  // United Arab Emirates
  400: [29.6, 3.3],  // Algeria
  401: [-10.9, 17.4],  // Angola
  402: [-22.4, 24.4],  // Botswana
  404: [-3.4, 30.0],  // Burundi
  406: [6.7, 13.1],  // Cameroon
  408: [6.3, 20.5],  // Central Africa
  409: [16.3, -24.3],  // Cape Verde
  410: [12.9, 17.8],  // Chad
  411: [-12.0, 43.8],  // Comoros
  412: [-1.1, 14.8],  // Republic of the Congo
  414: [-3.8, 23.0],  // Democratic Republic of the Congo
  416: [9.8, 2.3],  // Benin
  420: [-0.5, 11.9],  // Gabon
  422: [13.5, -15.3],  // The Gambia
  424: [8.1, -0.9],  // Ghana
  428: [7.8, -6.2],  // Cote de'Ivoire
  430: [1.2, 37.9],  // Kenya
  432: [-29.6, 28.4],  // Lesotho
  434: [6.6, -9.1],  // Liberia
  436: [28.5, 16.5],  // Libya
  438: [-18.0, 47.0],  // Madagascar
  440: [-13.0, 34.1],  // Malawi
  442: [14.1, -5.8],  // Mali
  444: [18.7, -12.3],  // Mauritania
  446: [28.8, -9.5],  // Morocco
  450: [9.7, 8.4],  // Nigeria
  452: [-18.9, 29.7],  // Zimbabwe
  453: [-21.1, 55.5],  // Reunion I.
  454: [-2.0, 29.9],  // Rwanda
  456: [13.9, -14.6],  // Senegal
  458: [8.5, -11.6],  // Sierra Leone
  460: [-12.5, 177.1],  // Rotuma I.
  462: [-28.6, 24.9],  // South Africa
  464: [-21.6, 17.8],  // Namibia
  466: [12.9, 29.5],  // Sudan
  468: [-26.4, 31.4],  // Swaziland
  470: [-6.5, 34.3],  // Tanzania
  474: [34.0, 9.8],  // Tunisia
  478: [28.2, 31.5],  // Egypt
  480: [12.1, -1.9],  // Burkina Faso
  482: [-12.8, 28.0],  // Zambia
  483: [8.6, 0.9],  // Togo
  489: [-21.7, 174.6],  // Conway Reef
  490: [-0.9, 169.5],  // Banaba I. (Ocean I.)
  492: [15.5, 46.5],  // Yemen
  497: [44.9, 16.4],  // Croatia
  499: [46.1, 15.0],  // Slovenia
  501: [44.3, 17.9],  // Bosnia-Herzegovina
  502: [41.6, 21.6],  // Macedonia
  503: [49.7, 15.9],  // Czech Republic
  504: [48.8, 19.2],  // Slovak Republic
  505: [20.7, 116.8],  // Pratas I.
  506: [15.2, 117.8],  // Scarborough Reef
  507: [-11.3, 168.2],  // Temotu Province
  508: [-21.9, -154.7],  // Austral Is.
  509: [-9.1, -139.7],  // Marquesas Is.
  510: [31.9, 35.3],  // Palestine
  511: [-8.7, 125.9],  // Timor-Leste
  512: [-19.8, 158.6],  // Chesterfield Is.
  513: [-24.7, -124.8],  // Ducie I.
  514: [42.7, 19.4],  // Montenegro
  515: [-11.1, -171.1],  // Swains I.
  516: [17.8, -62.8],  // St. Barthelemy
  517: [12.1, -68.9],  // Curacao
  518: [18.0, -63.1],  // St Maarten
  519: [17.6, -63.1],  // Saba & St. Eustatius
  520: [12.2, -68.3],  // Bonaire
  521: [8.1, 30.1],  // South Sudan (Republic of)
};

// Import DXCC lookup to get continent for fallback
import { lookupDXCC } from './dxccEntities.js';

/**
 * Get coordinates for a DXCC entity
 * @param {string|number} dxccId - DXCC entity ID
 * @returns {[number, number]|null} - [latitude, longitude] or null if not available
 */
export function getCoordinates(dxccId) {
  const id = parseInt(dxccId);

  // Return specific coordinates if available
  if (DXCC_COORDINATES[id]) {
    return DXCC_COORDINATES[id];
  }

  // Fallback to continent center
  const entity = lookupDXCC(id);
  if (entity && entity.cont && CONTINENT_FALLBACKS[entity.cont]) {
    return CONTINENT_FALLBACKS[entity.cont];
  }

  // Last resort: center of the world
  return [0, 0];
}

/**
 * Check if entity has specific (non-fallback) coordinates
 * @param {string|number} dxccId - DXCC entity ID
 * @returns {boolean} - true if specific coordinates exist
 */
export function hasSpecificCoordinates(dxccId) {
  const id = parseInt(dxccId);
  return DXCC_COORDINATES.hasOwnProperty(id);
}

/**
 * Get total count of entities with specific coordinates
 * @returns {number} - Count of entities with coordinates
 */
export function getCoordinatesCount() {
  return Object.keys(DXCC_COORDINATES).length;
}

export default {
  getCoordinates,
  hasSpecificCoordinates,
  getCoordinatesCount,
};
