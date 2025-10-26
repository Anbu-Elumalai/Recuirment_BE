import { ObjectId } from 'mongoose';
// import UserActivityLog from '../../app/model/user.activity';
import { Request } from 'express';
import { string } from 'zod';
import  CountryCode, { SubscriptionStatus }  from "../common/enum"

export const logUserActivity = async (userId: any,
    req: Request,
    userName: string,
    actionPerformed: string
): Promise<void> => {
    try {
        const ipAddress =
            (req.headers['x-forwarded-for'] as string) ||
            req.socket.remoteAddress ||
            req.ip;

        const userAgent = req.headers['user-agent'] || '';
        const deviceUsed = getDeviceUsed(userAgent);

        // const logEntry = new UserActivityLog({
        //     userName,
        //     actionPerformed,
        //     dateTime: new Date(),
        //     ipAddress,
        //     deviceUsed,
        //     userId
        // });
        // await logEntry.save();
        // const log = new UserActivityLog();
        // log.userName = userName;
        // log.actionPerformed = actionPerformed;
        // log.ipAddress = ipAddress ?? '';
        // log.deviceUsed = deviceUsed;
        // log.userId = new ObjectId(userId)
        console.log('User activity recorded.');
    } catch (err) {
        console.error('Error logging user activity:', err);
    }
};

// Helper: Detect device/browser from User-Agent
const getDeviceUsed = (userAgent: string): string => {
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';

    if (/windows nt 10/i.test(userAgent)) os = 'Windows 10';
    else if (/windows nt 11/i.test(userAgent)) os = 'Windows 11';
    else if (/mac os/i.test(userAgent)) os = 'MacOS';
    else if (/android/i.test(userAgent)) os = 'Android';
    else if (/iphone|ipad/i.test(userAgent)) os = 'iOS';
    else if (/linux/i.test(userAgent)) os = 'Linux';

    if (/chrome|crios/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) browser = 'Safari';
    else if (/edg/i.test(userAgent)) browser = 'Edge';
    else if (/opr|opera/i.test(userAgent)) browser = 'Opera';
    else if (/msie|trident/i.test(userAgent)) browser = 'Internet Explorer';

    return `${os} - ${browser}`;
};


export const getCountryCode =async (countryCode: string):Promise< CountryCode | null> => {
    switch (countryCode) {
        case "AF":
            return CountryCode.Afghanistan
        case "AX":
            return CountryCode.ÅlandIslands
        case "AL":
            return CountryCode.Albania
        case "DZ":
            return CountryCode.Algeria
        case "AS":
            return CountryCode.AmericanSamoa
        case "AD":
            return CountryCode.Andorra
        case "AO":
            return CountryCode.Angola
        case "AI":
            return CountryCode.Anguilla
        case "AQ":
            return CountryCode.Antarctica
        case "AG":
            return CountryCode.AntiguaAndBarbuda
        case "AR":
            return CountryCode.Argentina
        case "AM":
            return CountryCode.Armenia
        case "AW":
            return CountryCode.Aruba
        case "AU":
            return CountryCode.Australia
        case "AT":
            return CountryCode.Austria
        case "AZ":
            return CountryCode.Azerbaijan
        case "BS":
            return CountryCode.Bahamas
        case "BH":
            return CountryCode.Bahrain
        case "BD":
            return CountryCode.Bangladesh
        case "BB":
            return CountryCode.Barbados
        case "BY":
            return CountryCode.Belarus
        case "BE":
            return CountryCode.Belgium
        case "BZ":
            return CountryCode.Belize
        case "BJ":
            return CountryCode.Benin
        case "BM":
            return CountryCode.Bermuda
        case "BT":
            return CountryCode.Bhutan
        case "BO":
            return CountryCode.Bolivia
        case "BQ":
            return CountryCode.BonaireSintEustatiusAndSaba
        case "BA":
            return CountryCode.BosniaAndHerzegovina
        case "BW":
            return CountryCode.Botswana
        case "BV":
            return CountryCode.BouvetIsland
        case "BR":
            return CountryCode.Brazil
        case "IO":
            return CountryCode.BritishIndianOceanTerritory
        case "BN":
            return CountryCode.Brunei
        case "BG":
            return CountryCode.Bulgaria
        case "BF":
            return CountryCode.BurkinaFaso
        case "BI":
            return CountryCode.Burundi
        case "KH":
            return CountryCode.Cambodia
        case "CM":
            return CountryCode.Cameroon
        case "CA":
            return CountryCode.Canada
        case "CV":
            return CountryCode.CapeVerde
        case "KY":
            return CountryCode.CaymanIslands
        case "CF":
            return CountryCode.CentralAfricanRepublic
        case "TD":
            return CountryCode.Chad
        case "CL":
            return CountryCode.Chile
        case "CN":
            return CountryCode.China
        case "CX":
            return CountryCode.ChristmasIsland
        case "CC":
            return CountryCode.CocosKeelingIslands
        case "CO":
            return CountryCode.Colombia
        case "KM":
            return CountryCode.Comoros
        case "CG":
            return CountryCode.Congo
        case "CD":
            return CountryCode.DemocraticRepublicOfTheCongo
        case "CK":
            return CountryCode.CookIslands
        case "CR":
            return CountryCode.CostaRica
        case "CI":
            return CountryCode.IvoryCoast
        case "HR":
            return CountryCode.Croatia
        case "CU":
            return CountryCode.Cuba
        case "CW":
            return CountryCode.Curacao
        case "CY":
            return CountryCode.Cyprus
        case "CZ":
            return CountryCode.CzechRepublic
        case "DK":
            return CountryCode.Denmark
        case "DJ":
            return CountryCode.Djibouti
        case "DM":
            return CountryCode.Dominica
        case "DO":
            return CountryCode.DominicanRepublic
        case "EC":
            return CountryCode.Ecuador
        case "EG":
            return CountryCode.Egypt
        case "SV":
            return CountryCode.ElSalvador
        case "GQ":
            return CountryCode.EquatorialGuinea
        case "ER":
            return CountryCode.Eritrea
        case "EE":
            return CountryCode.Estonia
        case "ET":
            return CountryCode.Ethiopia
        case "FK":
            return CountryCode.FalklandIslands
        case "FO":
            return CountryCode.FaroeIslands
        case "FJ":
            return CountryCode.Fiji
        case "FI":
            return CountryCode.Finland
        case "FR":
            return CountryCode.France
        case "GF":
            return CountryCode.FrenchGuiana
        case "PF":
            return CountryCode.FrenchPolynesia
        case "TF":
            return CountryCode.FrenchSouthernTerritories
        case "GA":
            return CountryCode.Gabon
        case "GM":
            return CountryCode.Gambia
        case "GE":
            return CountryCode.Georgia
        case "DE":
            return CountryCode.Germany
        case "GH":
            return CountryCode.Ghana
        case "GI":
            return CountryCode.Gibraltar
        case "GR":
            return CountryCode.Greece
        case "GL":
            return CountryCode.Greenland
        case "GD":
            return CountryCode.Grenada
        case "GP":
            return CountryCode.Guadeloupe
        case "GU":
            return CountryCode.Guam
        case "GT":
            return CountryCode.Guatemala
        case "GG":
            return CountryCode.Guernsey
        case "GN":
            return CountryCode.Guinea
        case "GW":
            return CountryCode.GuineaBissau
        case "GY":
            return CountryCode.Guyana
        case "HT":
            return CountryCode.Haiti
        case "HM":
            return CountryCode.HeardIslandAndMcDonaldIslands
        case "VA":
            return CountryCode.HolySee
        case "HN":
            return CountryCode.Honduras
        case "HK":
            return CountryCode.HongKong
        case "HU":
            return CountryCode.Hungary
        case "IS":
            return CountryCode.Iceland
        case "IN":
            return CountryCode.India
        case "ID":
            return CountryCode.Indonesia
        case "IR":
            return CountryCode.Iran
        case "IQ":
            return CountryCode.Iraq
        case "IE":
            return CountryCode.Ireland
        case "IM":
            return CountryCode.IsleOfMan
        case "IL":
            return CountryCode.Israel
        case "IT":
            return CountryCode.Italy
        case "JM":
            return CountryCode.Jamaica
        case "JP":
            return CountryCode.Japan
        case "JE":
            return CountryCode.Jersey
        case "JO":
            return CountryCode.Jordan
        case "KZ":
            return CountryCode.Kazakhstan
        case "KE":
            return CountryCode.Kenya
        case "KI":
            return CountryCode.Kiribati
        case "KP":
            return CountryCode.NorthKorea
        case "KR":
            return CountryCode.SouthKorea
        case "KW":
            return CountryCode.Kuwait
        case "KG":
            return CountryCode.Kyrgyzstan
        case "LA":
            return CountryCode.Laos
        case "LV":
            return CountryCode.Latvia
        case "LB":
            return CountryCode.Lebanon
        case "LS":
            return CountryCode.Lesotho
        case "LR":
            return CountryCode.Liberia
        case "LY":
            return CountryCode.Libya
        case "LI":
            return CountryCode.Liechtenstein
        case "LT":
            return CountryCode.Lithuania
        case "LU":
            return CountryCode.Luxembourg
        case "MO":
            return CountryCode.Macau
        case "MK":
            return CountryCode.Macedonia
        case "MG":
            return CountryCode.Madagascar
        case "MW":
            return CountryCode.Malawi
        case "MY":
            return CountryCode.Malaysia
        case "MV":
            return CountryCode.Maldives
        case "ML":
            return CountryCode.Mali
        case "MT":
            return CountryCode.Malta
        case "MH":
            return CountryCode.MarshallIslands
        case "MQ":
            return CountryCode.Martinique
        case "MR":
            return CountryCode.Mauritania
        case "MU":
            return CountryCode.Mauritius
        case "YT":
            return CountryCode.Mayotte
        case "MX":
            return CountryCode.Mexico
        case "FM":
            return CountryCode.Micronesia
        case "MD":
            return CountryCode.Moldova
        case "MC":
            return CountryCode.Monaco
        case "MN":
            return CountryCode.Mongolia
        case "ME":
            return CountryCode.Montenegro
        case "MS":
            return CountryCode.Montserrat
        case "MA":
            return CountryCode.Morocco
        case "MZ":
            return CountryCode.Mozambique
        case "MM":
            return CountryCode.Myanmar
        case "NA":
            return CountryCode.Namibia
        case "NR":
            return CountryCode.Nauru
        case "NP":
            return CountryCode.Nepal
        case "NL":
            return CountryCode.Netherlands
        case "NC":
            return CountryCode.NewCaledonia
        case "NZ":
            return CountryCode.NewZealand
        case "NI":
            return CountryCode.Nicaragua
        case "NE":
            return CountryCode.Niger
        case "NG":
            return CountryCode.Nigeria
        case "NU":
            return CountryCode.Niue
        case "NF":
            return CountryCode.NorfolkIsland
        case "MP":
            return CountryCode.NorthernMarianaIslands
        case "NO":
            return CountryCode.Norway
        case "OM":
            return CountryCode.Oman
        case "PK":
            return CountryCode.Pakistan
        case "PW":
            return CountryCode.Palau
        case "PS":
            return CountryCode.Palestine
        case "PA":
            return CountryCode.Panama
        case "PG":
            return CountryCode.PapuaNewGuinea
        case "PY":
            return CountryCode.Paraguay
        case "PE":
            return CountryCode.Peru
        case "PH":
            return CountryCode.Philippines
        case "PN":
            return CountryCode.PitcairnIslands
        case "PL":
            return CountryCode.Poland
        case "PT":
            return CountryCode.Portugal
        case "PR":
            return CountryCode.PuertoRico
        case "QA":
            return CountryCode.Qatar
        case "RE":
            return CountryCode.Reunion
        case "RO":
            return CountryCode.Romania
        case "RU":
            return CountryCode.Russia
        case "RW":
            return CountryCode.Rwanda
        case "BL":
            return CountryCode.SaintBarthelemy
        case "SH":
            return CountryCode.SaintHelena
        case "KN":
            return CountryCode.SaintKittsAndNevis
        case "LC":
            return CountryCode.SaintLucia
        case "MF":
            return CountryCode.SaintMartin
        case "PM":
            return CountryCode.SaintPierreAndMiquelon
        case "VC":
            return CountryCode.SaintVincentAndTheGrenadines
        case "WS":
            return CountryCode.Samoa
        case "SM":
            return CountryCode.SanMarino
        case "ST":
            return CountryCode.SaoTomeAndPrincipe
        case "SA":
            return CountryCode.SaudiArabia
        case "SN":
            return CountryCode.Senegal
        case "RS":
            return CountryCode.Serbia
        case "SC":
            return CountryCode.Seychelles
        case "SL":
            return CountryCode.SierraLeone
        case "SG":
            return CountryCode.Singapore
        case "SX":
            return CountryCode.SintMaarten
        case "SK":
            return CountryCode.Slovakia
        case "SI":
            return CountryCode.Slovenia
        case "SB":
            return CountryCode.SolomonIslands
        case "SO":
            return CountryCode.Somalia
        case "ZA":
            return CountryCode.SouthAfrica
        case "GS":
            return CountryCode.SouthGeorgiaAndTheSouthSandwichIslands
        case "SS":
            return CountryCode.SouthSudan
        case "ES":
            return CountryCode.Spain
        case "LK":
            return CountryCode.SriLanka
        case "SD":
            return CountryCode.Sudan
        case "SR":
            return CountryCode.Suriname
        case "SJ":
            return CountryCode.SvalbardAndJanMayen
        case "SZ":
            return CountryCode.Swaziland
        case "SE":
            return CountryCode.Sweden
        case "CH":
            return CountryCode.Switzerland
        case "SY":
            return CountryCode.Syria
        case "TW":
            return CountryCode.Taiwan
        case "TJ":
            return CountryCode.Tajikistan
        case "TZ":
            return CountryCode.Tanzania
        case "TH":
            return CountryCode.Thailand
        case "TL":
            return CountryCode.TimorLeste
        case "TG":
            return CountryCode.Togo
        case "TK":
            return CountryCode.Tokelau
        case "TO":
            return CountryCode.Tonga
        case "TT":
            return CountryCode.TrinidadAndTobago
        case "TN":
            return CountryCode.Tunisia
        case "TR":
            return CountryCode.Turkey
        case "TM":
            return CountryCode.Turkmenistan
        case "TC":
            return CountryCode.TurksAndCaicosIslands
        case "TV":
            return CountryCode.Tuvalu
        case "UG":
            return CountryCode.Uganda
        case "UA":
            return CountryCode.Ukraine
        case "AE":
            return CountryCode.UnitedArabEmirates
        case "GB":
            return CountryCode.UnitedKingdom
        case "US":
            return CountryCode.UnitedStates
        case "UY":
            return CountryCode.Uruguay
        case "UZ":
            return CountryCode.Uzbekistan
        case "VU":
            return CountryCode.Vanuatu
        case "VE":
            return CountryCode.Venezuela
        case "VN":
            return CountryCode.Vietnam
        case "VG":
            return CountryCode.VirginIslands
        case "VI":
            return CountryCode.UnitedStatesVirginIslands
        case "WF":
            return CountryCode.WallisAndFutuna
        case "EH":
            return CountryCode.WesternSahara
        case "YE":
            return CountryCode.Yemen
        case "ZM":
            return CountryCode.Zambia
        case "ZW":
            return CountryCode.Zimbabwe
        default:
            return null // Or an empty string if preferred
    }
}
export const getSubscriptionStatusMessage = async (status: string): Promise<SubscriptionStatus | null> => {
  switch (status) {
    case SubscriptionStatus.Pending:
      return SubscriptionStatus.Pending;
    case SubscriptionStatus.Active:
      return SubscriptionStatus.Active
    case SubscriptionStatus.OnHold:
      return SubscriptionStatus.OnHold
    case SubscriptionStatus.Cancelled:
      return SubscriptionStatus.Cancelled
    case SubscriptionStatus.Failed:
      return SubscriptionStatus.Failed
    case SubscriptionStatus.Expired:
      return SubscriptionStatus.Expired
    default:
      return null;
  }
};

