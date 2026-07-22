var AdaniAlgosecClientCallable = Class.create();
AdaniAlgosecClientCallable.prototype = Object.extendsObject(AbstractAjaxProcessor, {


    handleBasicExcelValidation: function(file_sys_id, template_type) {

        //Original Source	Original Destination Public IP	Original Service	Translated Destination 	Translated Services 
        var requestType = this.getParameter('sysparam_requestType');
        template_type = this.getParameter('file_type') || template_type;
        file_sys_id = this.getParameter('file_sys_id') || file_sys_id;
        gs.log(template_type + "," + file_sys_id, 'alkfjkasjfkjasfls');

        var headersList = gs.getProperty('adani.firewall.generic.headers');
        var parsedHeaders = JSON.parse(headersList);
        // gs.log(template_type)
        var headersData;

        if (template_type == 'GCP') {
            this.headersData = parsedHeaders.application_gcp;
        } else if (template_type == "Azure") {
            this.headersData = parsedHeaders.application_azure;
        } else if (template_type == 'OnPrem') {
            this.headersData = parsedHeaders.application_on_prem;
        } else if(template_type == 'OnboardingF5'){
			this.headersData = parsedHeaders.onboarding_f5;
		}

		if(JSUtil.notNil(this.headersData.headerNumber)){
			this.headerStart = this.headersData.headerNumber;
		}

        this.expectedHeaders = [];

        this.expectedHeaders = this.headersData.headers;

		var number = this._getRowCount(file_sys_id);
        if (number == 0) {
            return JSON.stringify({
                areHeadersEqual: "",
                allColumnsAreValid: false,
                errors: [{
                    row: null,
                    column: null,
                    value: null,
                    message: "File doesn't contain any data"
                }],
                typeOfCommunication: ""
            });
        }

		if(template_type === 'OnboardingF5'){
			return JSON.stringify({
                areHeadersEqual: "",
                allColumnsAreValid: "",
                errors: [],
                typeOfCommunication: ""
            });
		}

        // gs.log(this.headersData, "alkfjkasjfkjasfls")
        var att = new GlideSysAttachment().getContentStream(file_sys_id);
        var parser = new sn_impex.GlideExcelParser();
        parser.parse(att);

        //Compare Headers
        var fileHeaders = parser.getColumnHeaders();
        var checkHeaders = this._compareHeaders(this.expectedHeaders, fileHeaders);

        //Check Empty Data
        if (checkHeaders) {
            var validationErrors = this._validateAllColumns(parser, fileHeaders);
            var allColumnsAreValid = validationErrors.length === 0;
        }

        return JSON.stringify({
            areHeadersEqual: checkHeaders,
            allColumnsAreValid: allColumnsAreValid,
            errors: validationErrors,
            typeOfCommunication: ""
        });
    },
    handleExcelValidation: function(file_sys_id) {
        /**  var expectedHeaders = [
        	"Source IP/User IP",
        	"Source Location",
        	"Destination IP",
        	"Destination Location",
        	"Destination Application",
        	"Destination Domain",
        	"(Service) TCP/UDP",
        	"Unidirectional/Bidirectional",
        	"Action (Allow/Deny)"
        ]; */
        var expectedHeaders;

        var expectedHeadersJSON = gs.getProperty('adani.algosec.validHeadersForExcel');

        this.expectedHeaders = JSON.parse(expectedHeadersJSON);
        /** 
        var privateRanges = [
        	{ start: '10.0.0.0', end: '10.255.255.255' },
        	{ start: '172.16.0.0', end: '172.31.255.255' },
        	{ start: '192.168.0.0', end: '192.168.255.255' }
        ];
        */

        var privateRanges;

        var privateIPRangeJSON = gs.getProperty('adani.algosec.private.ranges.json'); // JSON of the array

        privateRanges = JSON.parse(privateIPRangeJSON);


        var file_id = this.getParameter('sysparam_attSysId') || file_sys_id;

        var att = new GlideSysAttachment().getContentStream(file_id);
        var parser = new sn_impex.GlideExcelParser();
        parser.parse(att);



        //[izt.vijay 20260106] ===== ADDING ROW COUNT VALIDATION =====
        var mAX_ROWS = 500; // Maximum allowed number of rows in the Excel file
        var rowCountTemp = 0; // Variable to keep track of the row count

        // // First pass: count rows in the uploaded Excel file
        var attTemp = new GlideSysAttachment().getContentStream(file_id); // Get Excel file content as a stream
        var tempParser = new sn_impex.GlideExcelParser(); // Initialize Excel parser
        tempParser.parse(attTemp); // Parse the Excel file

        while (tempParser.next()) {
            rowCountTemp++; // Increment row count for each row

            // Stop counting if row count exceeds the maximum limit
            if (rowCountTemp > mAX_ROWS) {
                break;
            }
        }

        // Validate if the Excel file exceeds the allowed row limit
        if (rowCountTemp > mAX_ROWS) {
            // gs.log(rowCountTemp, "rowcountTempEXL");
            return JSON.stringify({
                areHeadersEqual: true,
                allColumnsAreValid: false,
                errors: [{
                    row: null,
                    column: null,
                    value: null,
                    message: "Excel file exceeds maximum, allowed only 500 rows."
                }],
                typeOfCommunication: 'private'
            });
        }
        //[izt.vijay 20260106] ===== END ROW VALIDATION =====




        var headers = parser.getColumnHeaders();

        var areHeadersEqual = this._compareHeaders(this.expectedHeaders, headers);
        this.overallTypeOfCommunication = 'private';
        if (areHeadersEqual) {
            // Capture validation errors from data
            var validationErrors = this._validateAllColumns(parser, headers);

            // true if there are no errors
            var allColumnsAreValid = validationErrors.length === 0;
        }

        // Final result
        return JSON.stringify({
            areHeadersEqual: areHeadersEqual,
            allColumnsAreValid: allColumnsAreValid,
            errors: validationErrors,
            typeOfCommunication: this.overallTypeOfCommunication
        });

        /** Function to validate all 3 ips End */
        /**** Functions for checking if ip is within range START */
        /**** Functions for checking if ip is within range END */

        // Allows NA, any valid domain
        // function isValidDomain(value, rowNumber, header) {
        // 	var regex = /^[A-Za-z0-9-]{1,63}\.[A-Za-z]{2,6}$/;

        // 	if (!value) {
        // 		return false;
        // 	}
        // 	value = value.trim();
        // 	var isValidDomain = regex.test(value) ? true : false;

        // 	if (isValidDomain) {
        // 		return { isValid: true, message: "" };
        // 	} else if (value == "NA") {
        // 		return { isValid: true, message: "" };
        // 	} else {
        // 		return {
        // 			isValid: false,
        // 			message: `${header} [Row ${rowNumber}] has invalid domain value: '${value}'`
        // 		};
        // 	}
        // }


    },
    _validateAllColumns: function(parser, headersInExcelArray) {
        var rowCount = 0;
        var errorList = [];

        while (parser.next()) {
            rowCount++;
            var row = parser.getRow();

            for (var i = 0; i < headersInExcelArray.length; i++) {
                var header = headersInExcelArray[i];

                // Excpected header will have values from expected header array
                var expectedHeader = this.expectedHeaders.find(e => header.startsWith(e));

                var cellValue = row[header]; // row["Source IP/User IP (Optional xyz)"]
                var validationResult = this._validateCell(expectedHeader, cellValue, rowCount);

                if (!validationResult.isValid) {
                    errorList.push({
                        row: rowCount,
                        column: header,
                        value: cellValue,
                        message: validationResult.message
                    });
                }

                // Determine communication type
                if (
                    validationResult.isValid &&
                    (header.startsWith("Source IP/User IP") || header.startsWith("Destination IP"))
                ) {
                    var isPrivate = this._isWithinPrivateIPRangesFromResult(validationResult);
                    // If any IP is public, set overallTypeOfCommunication once
                    if (!isPrivate && this.overallTypeOfCommunication !== "public") {
                        this.overallTypeOfCommunication = "public";
                    }
                }
                // If a valid domain is present in the cell then mark the overallTypeOfCommunication as public once
                if (header.startsWith("Destination Domain") && this.overallTypeOfCommunication !== "public") {
                    var isDomainValid = this._validateDomain(cellValue);

                    if (isDomainValid) {
                        this.overallTypeOfCommunication = 'public';
                    }
                }
            }
        }
        // Check if no rows were found
        if (rowCount === 0) {
            errorList.push({
                row: null,
                column: null,
                value: null,
                message: "Excel sheet cannot be empty. Please add at least one row of data."
            });
        }

        return errorList;
    },
    _validateCell: function(header, cellValue, rowNumber) {
        var result = {
            isValid: true,
            message: ""
        };
        cellValue = (cellValue || "").toString().trim();

        if (JSUtil.notNil(this.headersData)) {
            var index = this.headersData.headers.indexOf(header);
            if (this.headersData.headers[index]) {
                switch (this.headersData.type[index]) {
                    case "IP":
                        result = this._validateIPAddressFormat(cellValue, rowNumber, header);
                        result.ipValue = cellValue;
                        break;
                    case "ServicePort":
                        result = this._validateServicePort(cellValue, rowNumber, header);
                        break;
                }
                return result;
            }
        }

        switch (header) {
            case "Source IP/User IP":
            case "Destination IP":
                result = this._validateIPAddressFormat(cellValue, rowNumber, header);
                result.ipValue = cellValue;
                break;
            case "Source Location":
                result = this._validateIfAllFieldsArePresent(cellValue, rowNumber, header);
                break;
            case "Destination Location":
                result = this._validateIfAllFieldsArePresent(cellValue, rowNumber, header);
                break;
            case "Destination Application":
                result = this._validateIfAllFieldsArePresent(cellValue, rowNumber, header);
                break;
            case "Destination Domain":
                result = this._isValidDomain(cellValue, rowNumber, header);
                break;
            case "(Service) TCP/UDP":
                result = this._validateServicePort(cellValue, rowNumber, header);
                break;
            case "Unidirectional/Bidirectional":
                result = this._validateDirectionType(cellValue, rowNumber, header);
                break;
            case "Action (Allow/Deny)":
                result = this._validateAction(cellValue, rowNumber, header);
                break;
            case "Source Host Name":
                result = this._validateIfAllFieldsArePresent(cellValue, rowNumber, header);
                break;
            case "Destination Host Name":
                result = this._validateIfAllFieldsArePresent(cellValue, rowNumber, header);
                break;
        }
        return result;
    },

    _checkRowCount: function(file_id, max_count) {
        var getCount = this._getRowCount(file_id);
        if (max_count != 0) {
            if (getCount > max_count) {
                return JSON.stringify({
                    areHeadersEqual: true,
                    allColumnsAreValid: false,
                    errors: [{
                        row: null,
                        column: null,
                        value: null,
                        message: "Excel file exceeds maximum, allowed only " + max_count + " rows."
                    }],
                    typeOfCommunication: 'private'
                });
            }
        }
        return true;
    },
    _getRowCount: function(file_id) {
        var attTemp = new GlideSysAttachment().getContentStream(file_id); // Get Excel file content as a stream
        var tempParser = new sn_impex.GlideExcelParser(); // Initialize Excel parser
		if(this.headerStart !== 0){
			tempParser.setHeaderRowNumber(this.headerStart);
		}
        tempParser.parse(attTemp); // Parse the Excel file
        var rowCountTemp = 0;
        while (tempParser.next()) {
            rowCountTemp++; // Increment row count for each row
        }
        return rowCountTemp;
    },

    // Allow only valid domain
    _validateDomain: function(value) {
        // var regex = /^[A-Za-z0-9-]{1,63}\.[A-Za-z]{2,6}$/;

        // if (!value) {
        // 	return false;
        // }
        // value = value.trim();
        // var isValidDomain = regex.test(value) ? true : false;

        // if (isValidDomain) {
        // 	return true;
        // } else {
        // 	return false;
        // }

        var regex = /^[A-Za-z0-9-]{1,63}\.[A-Za-z]{2,6}$/;

        if (!value) {
            return false;
        }

        value = value.trim();

        // Block "adani" anywhere in the domain (case-insensitive)
        if (/adani/i.test(value)) {
            return false;
        }

        var isValidDomain = regex.test(value);

        if (isValidDomain) {
            return true;
        } else {
            return false;
        }
    },
    _isValidIP: function(ip) {
        var parts = ip.split('.');
        if (parts.length !== 4) return false;

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            // Regex checks for digits only (0-9)
            if (!/^\d+$/.test(part)) return false;

            var num = parseInt(part, 10);
            // Reject parts like '001', '02' (leading zeros are not valid)
            if (part.length > 1 && part[0] === '0') return false;

            // 0 < a < 255 - First octet (a) must be between 1 and 254 (0 and 255 are not allowed)
            if (i === 0) {
                if (num <= 0 || num > 255) return false;
            }
            // -1 < b/c/d < 255 - For the remaining octets (b, c, d), allow 0 to 254 (255 is not allowed)
            else {
                if (num < 0 || num > 255) return false;
            }
        }
        return true;
    },
    /** Lexicographical numeric comparison
         - Compare IP parts left to right: if startPart[i] < endPart[i], return  true (valid range).
        - If startPart[i] > endPart[i], return false (invalid range).
        - If equal, check the next octet.
         */
    _isStartIPLessThanEndIP: function(startIP, endIP) {
        var startParts = startIP.split('.').map(Number);
        var endParts = endIP.split('.').map(Number);

        for (var i = 0; i < 4; i++) {
            if (startParts[i] <= endParts[i]) return true;
            if (startParts[i] > endParts[i]) return false;
        }
        return false;
    },
    _isWithinPrivateIPRanges: function(ip) {
		var privateIPRangeJSON = gs.getProperty('adani.algosec.private.ranges.json'); // JSON of the array
        privateRanges = JSON.parse(privateIPRangeJSON);
        for (var i = 0; i < privateRanges.length; i++) {
            if (this._isWithinRange(ip, privateRanges[i].start, privateRanges[i].end)) {
                return true;
            }
        }
        return false;
    },
    _isWithinPrivateIPRangesFromResult: function(result) {
		var privateIPRangeJSON = gs.getProperty('adani.algosec.private.ranges.json'); // JSON of the array

        privateRanges = JSON.parse(privateIPRangeJSON);
        if (!result.isValid) return false;

        if (result.ipType === "single") {
            return this._isWithinPrivateIPRanges(result.ipValue);
        }

        if (result.ipType === "range") {
            var parts = result.ipValue.split('-');
            var start = parts[0].trim();
            var end = parts[1].trim();

            for (var i = 0; i < privateRanges.length; i++) {
                var p = privateRanges[i];
                if (
                    this._isWithinRange(start, p.start, p.end) &&
                    this._isWithinRange(end, p.start, p.end)
                ) {
                    return true;
                }
            }
            return false;
        }

        if (result.ipType === "cidr") {
            var parts = result.ipValue.split('/');
            var cidrIp = parts[0];
            return this._isWithinPrivateIPRanges(cidrIp);
        }

        return false;
    },

    _isWithinRange: function(ip, lowerBound, upperBound) {
        const ipLong = this._convertIpToLong(ip);
        const lowerLong = this._convertIpToLong(lowerBound);
        const upperLong = this._convertIpToLong(upperBound);

        if (isNaN(ipLong) || isNaN(lowerLong) || isNaN(upperLong)) return false;

        return ipLong >= lowerLong && ipLong <= upperLong;
    },
    _convertIpToLong: function(ip) {
        // commenting since ip is aldready validated
        // if (!ip || typeof ip !== 'string' || !/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
        // 	return NaN;
        // }
        var parts = ip.split('.').map(Number);
        if (parts.length !== 4 || parts.some(p => isNaN(p))) {
            return NaN;
        }
        return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3]; // a * 2 power 24
    },
    _validateDirectionType: function(value, rowNumber, header) {
        // var allowedValues = ["Unidirectional", "Bidirectional"];
        var allowedValues;
        var allowedValuesJSON = gs.getProperty('adani.algosec.allowedDirectionType');

        allowedValues = JSON.parse(allowedValuesJSON);


        if (!allowedValues.includes(value)) {
            return {
                isValid: false,
                message: `${header} [Row ${rowNumber}] has invalid value: '${value}'`
            };
        }
        return {
            isValid: true,
            message: ""
        };
    },

    _validateServicePort: function(cellValue, rowNumber, header) {
        var result = {
            isValid: true,
            message: ""
        };
        cellValue = (cellValue || "").toString().trim();

        //[izt.vijay 20260106] ===== ADD COMMA CHECK HERE =====
        // Check if the cell value contains a comma, which indicates multiple values in one cell
        if (cellValue.includes(',')) {
            return {
                isValid: false,
                message: `${header} [Row ${rowNumber}] contains more than one value. Each entry must be on a separate row. Value: '${cellValue}'`
            };
        }
        //[izt.vijay 20260106] ===== END COMMA CHECK =====



        // Allowed special protocols (must be lowercase only)
        // var specialProtocols = ["gre", "esp", "ah", "skip", "etherip", "pim", "icmp"];

        var specialProtocols;
        var specialProtocolsJSON = gs.getProperty('adani.algosec.allowedSpecialProtocols');
        specialProtocols = JSON.parse(specialProtocolsJSON);

        var entries = cellValue.split(',');

        for (var i = 0; i < entries.length; i++) {
            var originalEntry = entries[i].trim();
            var entry = originalEntry.toLowerCase();

            // Check if it is a special protocol (must be lowercase match)
            if (specialProtocols.includes(entry)) {
                if (originalEntry !== entry) {
                    result.isValid = false;
                    result.message = `${header} [Row ${rowNumber}] invalid: '${originalEntry}' → Special protocols must be in lowercase.`;
                    return result;
                }
                continue;
            }

            // Special protocol with port — invalid
            if (specialProtocols.some(proto => entry.startsWith(proto + "/"))) {
                result.isValid = false;
                result.message = `${header} [Row ${rowNumber}] invalid: '${originalEntry}' → Special protocols should not have ports.`;
                return result;
            }

            // Match tcp/port or tcp/port-range (case-insensitive)
            var regex = /^(tcp|udp)\/([1-9]\d{0,4})(?:-([1-9]\d{0,4}))?$/i;
            var match = originalEntry.match(regex);

            if (!match) {
                result.isValid = false;
                result.message = `${header} [Row ${rowNumber}] invalid format: '${originalEntry}'`;
                return result;
            }

            // Validate port values
            var port1 = parseInt(match[2], 10);
            var port2 = match[3] ? parseInt(match[3], 10) : null;

            if (port1 < 0 || port1 > 65535 || (port2 !== null && (port2 < 0 || port2 > 65535))) {
                result.isValid = false;
                result.message = `${header} [Row ${rowNumber}] has invalid port range: '${originalEntry}' (Valid: 0-65535)`;
                return result;
            }

            // Ensure correct port order
            if (port2 !== null && port1 > port2) {
                result.isValid = false;
                result.message = `${header} [Row ${rowNumber}] has invalid port range order: '${originalEntry}' (Start > End)`;
                return result;
            }
        }

        return result;
    },
    /** Function to validate all 3 ips START */
    _validateIPAddressFormat: function(ipValues, rowNumber, header) {
        var result = {
            isValid: true,
            message: "",
            ipType: ''
        };
        var flag = false;

        ipValues = ipValues.trim();
        result.ipValue = ipValues;
        var message = "";
        ipValues = ipValues.split(",");
        for (var i = 0; i < ipValues.length && !flag; i++) {
            var ipValue = ipValues[i];

            // CIDR format
            // Regex checks for x.x.x.x/y : x - 0 to 999, y - 0 to 99
            if (/^\d{1,3}(\.\d{1,3}){3}\/\d{1,2}$/.test(ipValue)) {
                var parts = ipValue.split('/');
                var ip = parts[0];
                var mask = parseInt(parts[1]);

                if (!this._isValidIP(ip)) {
                    result.isValid = false;
                    flag = true;
                    message += `${header} [Row ${rowNumber}] has invalid IP format: '${ip}'`;
                } else if (isNaN(mask) || mask <= 0 || mask >= 32) {
                    result.isValid = false;
                    flag = true;
                    message += `${header} [Row ${rowNumber}] has invalid subnet mask: '${mask}'`;
                }
                result.ipType = 'cidr';
                // return result;
            }

            // IP Range format
            // Regex checks for number.number.number.number-number.number.number.number (1-3 digits)
            if (/^\d{1,3}(\.\d{1,3}){3}-\d{1,3}(\.\d{1,3}){3}$/.test(ipValue)) {
                var parts = ipValue.split('-');
                var startIP = parts[0].trim();
                var endIP = parts[1].trim();

                if (!this._isValidIP(startIP) || !this._isValidIP(endIP)) {
                    result.isValid = false;
                    flag = true;
                    message += `${header} [Row ${rowNumber}] has invalid IP range format: '${ipValue}'`;
                } else if (!this._isStartIPLessThanEndIP(startIP, endIP)) {
                    result.isValid = false;
                    flag = true;
                    message += `${header} [Row ${rowNumber}] has invalid IP range order: '${startIP}' is not less than '${endIP}'`;
                }
                result.ipType = 'range';
                // return result;
            }

            // Single IP
            // Regex checks for number.number.number.number (1-3 digits)
            if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ipValue)) {
                if (!this._isValidIP(ipValue)) {
                    result.isValid = false;
                    flag = true;
                    message += `${header} [Row ${rowNumber}] has invalid IP format: '${ipValue}'`;
                }
                result.ipType = 'single';
                // return result;
            }

            // Unknown format
            if (result.ipType == "") {
                result.isValid = false;
                flag = true;
                message += `${header} [Row ${rowNumber}] has invalid IP format: '${ipValue}'`;

            }
        }
        result.message = message;
        return result;
    },
    _isValidDomain: function(value, rowNumber, header) {

        // Changes made by izt.kushagra to accept various domain for RITM3452877. 
        var regex = /^(?:\*\.)?(?!\-)(?:[A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,}$/;
        // Changes end 

        if (!value) {
            return {
                isValid: false,
                message: `${header} [Row ${rowNumber}] is empty`
            };
        }

        value = value.trim();

        // check if "adani" is present anywhere (case-insensitive)
        if (/adani/i.test(value)) {
            return {
                isValid: false,
                message: `${header} [Row ${rowNumber}] contains restricted keyword 'adani': '${value}'`
            };
        }

        var isValidDomain = regex.test(value);

        if (isValidDomain) {
            return {
                isValid: true,
                message: ""
            };
        } else if (value === "NA") {
            return {
                isValid: true,
                message: ""
            };
        } else {
            return {
                isValid: false,
                message: `${header} [Row ${rowNumber}] has invalid domain value: '${value}'. Valid value is NA`
            };
        }
    },
    _validateAction: function(value, rowNumber, header) {
        // var allowedValues = ["Allow", "Deny"];
        var allowedValues;
        var allowedValuesJSON = gs.getProperty('adani.algosec.allowedActions');

        allowedValues = JSON.parse(allowedValuesJSON);

        if (!allowedValues.includes(value)) {
            return {
                isValid: false,
                message: `${header} [Row ${rowNumber}] has invalid value: '${value}'`
            };
        }
        return {
            isValid: true,
            message: ""
        };
    },
    _compareHeaders: function(expectedHeaders, actualHeaders) {
        if (expectedHeaders.length !== actualHeaders.length) return false;

        for (var i = 0; i < actualHeaders.length; i++) {
            const actual = actualHeaders[i];
            const matches = expectedHeaders.some(expected => actual.startsWith(expected));
            if (!matches) return false;
        }
        return true;
    },

    _validateIfAllFieldsArePresent: function(value, rowNumber, header) {
        if (!value || value.trim() === "") {
            return {
                isValid: false,
                message: `${header} [Row ${rowNumber}] is required but missing or empty.`
            };
        }

        return {
            isValid: true,
            message: ""
        };
    },


    /** For testing in bg script
	 var excelSysID = '60ddadfa931aea503664b3dd1dba10c4';

var utils = new global.AdaniAlgosecClientCallable();
var a = utils.getXLSData(excelSysID);

gs.info(a); 
	 
	 */



    type: 'AdaniAlgosecClientCallable'
});