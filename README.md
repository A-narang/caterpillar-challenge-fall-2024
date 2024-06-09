# caterpillar-challenge-fall-2024
sandbox challenge 2024

## How to run your solution
Run node app.js in the terminal

## Your thought process/how you designed your solution

I started off using the sample data given and writing a function to get every participant's name and ID. From there I attempted to replace the sample data with a GET request. At first, I didn't use async/await to do this and I found that when I tried to use the data it would sometimes return as undefined. After looking into this error I discovered async functions can be used to ask the program to wait until the data has been returned from the API.

Then, to get the language information, rounds, and session duration, I had to find which sessions belonged to which participant. I wrote a method to filter sessions based on the participant's ID. I used this to get the average session duration. To get the average round score I had to write another method that found rounds based on round IDs. From there I was able to get the average round scores.

The most difficult part was getting the average scores and round durations based on each language as users could have multiple sessions/rounds with the same language and the program had to keep track of which rounds belonged to which languages. At first, I tried using an array to store all the languages across the sessions as well as their corresponding rounds, however, it was complicated to connect the languages to the round IDs. I ended up finding that hashmaps were the best solution as I could make the language a key and store an array of the corresponding round IDs.

## The primary technical problems you ran into while implementing this challenge

The first issue I ran into was not using an async function to make my GET request. This caused to program to not wait until the data had been retrieved. 

The second main issue was how to separate each participant's sessions by language while also keeping track of the corresponding array of round IDs. At first, I tried to use arrays but struggled to keep track of the information and couldn't come up with a simple way to combine data from multiple sessions that were in the same language. To fix this I ended up using a hashmap. This simplified the problem as I was able to make the language a key and sort the array of corresponding round ids as the value. Additionally, this simplified the issue of having multiple sessions in the same name as all I had to do was concat the round IDs from both sessions use that to replace the value in the hashmap.

## Approximate time it took you to complete this project
5 - 6 hours
