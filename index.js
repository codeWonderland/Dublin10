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
                    var memoriesString = "<div class='memory share-memory'><div class='outer-circle'>" +
                        "  <div class='chat-bubble'>" +
                        "    <div class='dot-holder'>" +
                        "      <div class='dot'></div>" +
                        "      <div class='dot'></div>" +
                        "      <div class='dot'></div>" +
                        "    </div>" +
                        "  </div>" +
                        "</div><a href='https://goo.gl/forms/uTKrbdy1ioRHaBoI2' target='_blank' class='green-button'>Share a memory</a></div>";

                    $(memories).each(function()
                    {
                        try
                        {
                            if (this.gsx$memory.$t != "" && this.gsx$photo.$t != "")
                            {
                                memoriesString += formatMemoryHTML(this, 'both');
                            }
                            else if (this.gsx$memory.$t != "" && this.gsx$photo.$t == "")
                            {
                                memoriesString += formatMemoryHTML(this, 'story');
                            }
                            else if (this.gsx$memory.$t == "" && this.gsx$photo.$t != "")
                            {
                                memoriesString += formatMemoryHTML(this, 'photo');
                            }
                            else
                            {
                                console.log("Error parsing memory: " + this);
                            }
                        }
                        catch (e)
                        {
                            console.log("Error parsing memory: " + this);
                            console.log("Error desc: " + e);
                        }
                    });

                    $('div.memory-container')[0].innerHTML = memoriesString;
                }

                function formatMemoryHTML(memory, type)
                {
                    memHTML = "";
                    classList = "";

                    switch(type)
                    {
                        case 'photo':
                            memHTML = '' +
                                '<div class="memory photo-mem" onclick="openPhotoMem(\'' + formatGImageURL(memory.gsx$photo.$t) + '\')">' +
                                '   <img src="' + formatGImageURL(memory.gsx$photo.$t) + '" alt="dublin memory">' +
                                '</div>';
                            break;
                        case 'story':
                            memHTML = '' +
                                '<div class="memory story-mem" onclick="openStoryMem(this)">' +
                                '   <div class="fade-container">' +
                                '   <p class="story">' + memory.gsx$memory.$t.replace(/\n(?=[A-Z])/g, '<br>') + '</p>' +
                                '   </div>' +
                                '   <p style="font-size: 16px;">(Click to see full story)</p>' +
                                '</div>';
                            break;
                        case 'both':
                            memHTML = '' +
                                '<div class="memory both-mem" onclick="openBothMem(this, ' + formatGImageURL(memory.gsx$photo.$t) + ')">' +
                                '   <img src="' + formatGImageURL(memory.gsx$photo.$t) + '" alt="dublin memory">' +
                                '   <div class="hover-story">' +
                                '       <div class="fade-container">' +
                                '           <p class="story">' + memory.gsx$memory.$t.replace(/\n(?=[A-Z])/g, '<br>') + '</p>' +
                                '       </div>' +
                                '       <p style="font-size: 16px;">(Click to see full story)</p>' +
                                '   </div>' +
                                '</div>';
                            break;
                        default:
                            console.log("Invalid type sent to formatMemoryHTML");
                            break;
                    }

                    return memHTML;
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

function formatGImageURL(url)
{
    if (url.substring(0, 33) === "https://drive.google.com/open?id=")
        return url.replace("open", "uc");
    else
        return url;
}

function openBothMem(memory, photo)
{
    var html = '<img style="width: 100%; height: auto;" src="' + photo + '" alt="memory">' +
        '<p>' + $(memory).find('p.story')[0].innerHTML + '</p>';
    openRemodal(html);
}

function openPhotoMem(photo)
{
    var html = '<img style="width: 100%; height: auto;" src="' + photo + '" alt="memory">';
    openRemodal(html);
}

function openStoryMem(memory)
{
    var html = '<p>' + $(memory).find('p.story')[0].innerHTML + '</p>';
    openRemodal(html);
}

function openRemodal(content)
{
    $memModal = $('div.remodal[data-remodal-id="mem-modal"]');
    $memModal.find('div.content')[0].innerHTML = content;
    var mymodal = $memModal.remodal();
    mymodal.open();
}