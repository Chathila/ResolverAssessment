const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

class SeleniumTestSuite {
    static driver;

    static async setUpClass() {
        this.driver = await new Builder().forBrowser('chrome').build();
        const indexHtmlPath = `file://${__dirname}/QE-index.html`;
        await this.driver.get(indexHtmlPath);
    }

    static async tearDownClass() {
        if (this.driver) {
            await this.driver.quit();
        }
    }

    static async testSignup() {
        console.log("Running Test 1: Sign-up");
        try {
            const test1 = await this.driver.findElement(By.id("test-1-div"));

            // Assert that both the email address and password inputs are present as well as the login button
            const emailInput = await test1.findElement(By.id("inputEmail"));
            const passwordInput = await test1.findElement(By.id("inputPassword"));
            const signupButton = await test1.findElement(By.xpath('//button[@type="submit"]'));
            assert.ok(emailInput, "Email input is not found");
            assert.ok(passwordInput, "Password input is not found");
            assert.ok(signupButton, "Sign-up button is not found");

            const emailRequired = await emailInput.getAttribute("required");
            const passwordRequired = await passwordInput.getAttribute("required");
            assert.ok(emailRequired !== null, "Email is not required");
            assert.ok(passwordRequired !== null, "Password is not required");

            // Enter in an email address and password combination into the respective fields
            await emailInput.sendKeys("chathila.ratnatilake@resolver.com");
            await passwordInput.sendKeys("password123");

            console.log("Test 1 passed!\n");
        } catch (e) {
            console.error(`Test 1 failed: ${e}`);
        }
    }

    static async testUnorderedList() {
        console.log("Running Test 2: Unordered List");
        try {
            const test2 = await this.driver.findElement(By.id("test-2-div"));

            // In the test 2 div, assert that there are three values in the listgroup
            const unorderedList = await test2.findElement(By.className("list-group"));
            const listItems = await unorderedList.findElements(By.className("list-group-item"));
            assert.strictEqual(listItems.length, 3, "List does not contain three items");

            // Assert that the second list item's value is set to "List Item 2"
            const secondItem = listItems[1];
            const secondItemText = await this.driver.executeScript(
                "return arguments[0].childNodes[0].textContent.trim();", secondItem
            );
            assert.strictEqual(secondItemText, "List Item 2", "Text in the second list item is incorrect");

            // Assert that the second list item's badge value is 6
            const textBadgeInSecondElement = await secondItem.findElement(By.className("badge")).getText();
            assert.strictEqual(textBadgeInSecondElement , "6", "Text in the badge on the second list item is not 6");

            console.log("Test 2 passed!\n");
        } catch (e) {
            console.error(`Test 2 failed: ${e}`);
        }
    }

    static async testDropdown() {
        console.log("Running Test 3: Dropdown Menu");
        try {
            const test3 = await this.driver.findElement(By.id("test-3-div"));

            // In the test 3 div, assert that "Option 1" is the default selected value
            const dropdown = await test3.findElement(By.className("dropdown"));
            const dropdownBtn = await dropdown.findElement(By.id("dropdownMenuButton"));
            const dropdownMenu = await dropdown.findElement(By.className("dropdown-menu"));
            let selectedText = await dropdownBtn.getText()
            assert.strictEqual(selectedText, "Option 1", "Default option is not Option 1");

            // Select "Option 3" from the select list
            await dropdownBtn.click()
            let classListMenu = await dropdownMenu.getAttribute("class");
            assert.ok(classListMenu.split(" ").includes("show"), "Class 'show' is not present");

            await dropdownMenu.findElement(By.xpath(".//a[text()='Option 3']")).click();
            selectedText = await dropdownBtn.getText()
            assert.strictEqual(selectedText, "Option 3", "Option was not changed to Option 3");

            console.log("Test 3 passed!\n");
        } catch (e) {
            console.error(`Test 3 failed: ${e}`);
        }
    }

    static async testButtons() {
        console.log("Running Test 4: Button State");
        try {
            const test4 = await this.driver.findElement(By.id("test-4-div"));

            // In the test 4 div, assert that the first button is enabled and that the second button is disabled
            const button1 = await test4.findElement(By.className("btn-primary"));
            const button2 = await test4.findElement(By.className("btn-secondary"));

            const button1Status = await button1.isEnabled();
            const button2Status = await button2.isEnabled();

            assert.ok(button1Status, "Button 1 is not Enabled")
            assert.ok(!button2Status, "Button 2 is not Disabled")
            
            console.log("Test 4 passed!\n");
        } catch (e) {
            console.error(`Test 4 failed: ${e}`);
        }
    }

    static async testPopUpMessage() {
        console.log("Running Test 5: Toggle Pop-up Message");
        try {
            const test5 = await this.driver.findElement(By.id("test-5-div"));

            // In the test 5 div, wait for a button to be displayed (note: the delay is random) and then click it
            const btn = await this.driver.wait(
                until.elementLocated(By.id("test5-button")),
                10000
            );

            const message =  await test5.findElement(By.id("test5-alert"));
            await this.driver.wait(until.elementIsVisible(btn), 10000);
            let isMessageDisplayed = await message.isDisplayed();
            assert.ok(!isMessageDisplayed); 
            await btn.click();

            // Once you've clicked the button, assert that a success message is displayed
            isMessageDisplayed = await message.isDisplayed();
            assert.ok(isMessageDisplayed, "Message is not displayed upon clicking the button");

            // Assert that the button is now disabled
            const btnStatus = await btn.isEnabled();
            assert.ok(!btnStatus, "Button remains to be enabled")

            console.log("Test 5 passed!\n");
        } catch (e) {
            console.error(`Test 5 failed: ${e}`);
        }
    }

    static async testTables() {
        console.log("Running Test 6: Tables");
        try {
            // Use the method to find the value of the cell at coordinates 2, 2 (staring at 0 in the top left corner)
            // Assert that the value of the cell is "Ventosanzap"
            const cellValue = await this.getCellValue("test-6-div", 2, 2);
            assert.strictEqual(cellValue, "Ventosanzap", "Ventosanzap is not found at position 2,2")
            
            console.log("Test 6 passed!\n");
        } catch (e) {
            console.error(`Test 6 failed: ${e}`);
        }
    }

    // Write a method that allows you to find the value of any cell on the grid
    static async getCellValue(parent, row, col) {
        const parentElement = await this.driver.findElement(By.id(parent));
        const tableBody = await parentElement.findElement(By.css("tbody"));
        const tableRows = await tableBody.findElements(By.css("tr"));

        if (row >= tableRows.length) {
            throw new Error(`Row index ${row} is out of bounds. Table only has ${tableRows.length} rows.`);
        }

        const selectedRow = tableRows[row];
        const tableColumns = await selectedRow.findElements(By.css("td"));

        if (col >= tableColumns.length) {
            throw new Error(`Column index ${col} is out of bounds. Row only has ${tableColumns.length} columns.`);
        }

        const selectedColumn = tableColumns[col];
        return await selectedColumn.getText();
    }
}

(async () => {
    await SeleniumTestSuite.setUpClass();
    await SeleniumTestSuite.testSignup();
    await SeleniumTestSuite.testUnorderedList();
    await SeleniumTestSuite.testDropdown();
    await SeleniumTestSuite.testButtons();
    await SeleniumTestSuite.testPopUpMessage();
    await SeleniumTestSuite.testTables();
    await SeleniumTestSuite.tearDownClass();
})();
