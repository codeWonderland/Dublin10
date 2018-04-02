var ccWaitTries = 10;
function waitForJQuery()
{
    if (window.$)
    {
        (function($)
        {
            console.log('in the anon function');
            $(document).ready(function()
            {
                console.log('in the dom ready');
                var memories = null;

                // Check for memories
                if (Modernizr.localstorage && localStorage.getItem('dublin10') !== null)
                {
                    console.log('have memories locally');
                    memories = $.parseJSON(localStorage.getItem('dublin10'));

                    // Make sure data is not expired
                    var twoHours = 1000 * 60 * 60 * 2, // two hours in milliseconds
                        now = new Date().getTime();

                    if (memories.date && now - memories.date < twoHours)
                    {
                        memories = memories.records;
                        handleMemories(memories);
                    }
                    else
                    {
                        memories = null;
                    }
                }

                if (!memories)
                {
                    console.log('fetching memories');

                    var spreadsheetID = "1hpN_gmoZu5tDIxKvatm84iShLppeEzZr_LLQ56MjXYs";

                    // Make sure it is public or set to "anyone with link can view" or we can't pull the JSON
                    // The number after the spreadsheet id is 2 because we are using the second sheet in the
                    // google sheets doc, the first being all forms responses
                    var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/2/public/values?alt=json";

                    var $memdata = $.ajax({
                        url: url,
                        dataType: "jsonp"
                    });

                    $memdata.done(function(data)
                    {
                        if (!data || !data.feed || !Object.keys(data.feed.entry).length)
                        {
                            console.log('Had a problem loading memory data! Data is: ');
                            console.log(data);
                            return;
                        }

                        if (data)
                        {
                            console.log('data from sheet:');
                            console.log(data);
                        }

                        var storedData =
                            {
                                records: data.feed.entry,
                                date: (new Date).getTime()
                            };

                        if (Modernizr.localstorage && JSON && JSON.stringify)
                        {
                            localStorage.setItem('dublin10', JSON.stringify(storedData));
                        }

                        memories = storedData.records;
                        handleMemories(memories);
                    })
                }

                // Function acquired from https://www.sitepoint.com/url-parameters-jquery/
                function urlParam(name)
                {
                    var results = new RegExp('[\?&]' + name + '=([^$#]*)').exec(window.location.href);
                    if (results == null)
                        return null;
                    else
                        return results[1] || 0;
                }

                function handleMemories(memories)
                {
                    console.log(memories);
                    console.log('handling memories');

                    // This string will be a total build of the html that we will push to the memory container
                    var memoriesString = "<div class='memory share-memory'><a href='https://goo.gl/forms/uTKrbdy1ioRHaBoI2' target='_blank' class='green-button'>Share a memory</a></div>";

                    $(memories).each(function(memory)
                    {
                        /* TODO: This whole part should essentially determine the type of memory and if it is one, the other, or both send the data to the formatMemoryHTML function */
                    })
                }

                function formatMemoryHTML(memory, type)
                {
                    switch(type)
                    {
                        case 'photo':
                            // TODO: Photo HTML
                            break;
                        case 'story':
                            // TODO: Story HTML
                            break;
                        default:
                            break;
                    }
                }

                function formatGImageURL(url)
                {
                    return url.replace("open", "uc");
                }
            });
        })(jQuery);
    } else
        {
        ccWaitTries--;
        if (ccWaitTries > 0)
        {
            setTimeout(waitForJQuery, 50);
        }
    }
}

waitForJQuery();